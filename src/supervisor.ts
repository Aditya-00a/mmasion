import { verificationPolicy } from "./config.js";
import type {
  AuditRun,
  DecisionSummary,
  DomainAgentRequest,
  HumanResolution,
  ProviderAdapter,
  TaskSubmission,
  VerificationCheckKind,
} from "./contracts.js";
import { HumanReviewStore } from "./hitl.js";
import { SmartRouter } from "./router.js";
import { FileRunStore } from "./store.js";
import { ConsensusEngine, VerificationMesh, buildAttempt } from "./verification.js";
import { createId, nowIso } from "./utils.js";

function scoreMap(attempt: AuditRun["attempts"][number]): Record<VerificationCheckKind, number> {
  return {
    grounding: attempt.verification.find((check) => check.kind === "grounding")?.score ?? 0,
    "cross-reference": attempt.verification.find((check) => check.kind === "cross-reference")?.score ?? 0,
    "semantic-policy": attempt.verification.find((check) => check.kind === "semantic-policy")?.score ?? 0,
  };
}

function deriveRiskLevel(run: AuditRun, attempt: AuditRun["attempts"][number]): DecisionSummary["riskLevel"] {
  const hasMeaningfulOpenRisks = attempt.responses.some((response) =>
    (response.openRisks ?? []).some((risk) => !/^no\b/i.test(risk.trim())),
  );

  if (run.status === "escalated") {
    return "critical";
  }

  if (run.status === "rolled_back" || attempt.verification.some((check) => check.blocking)) {
    return "high";
  }

  if (attempt.consensus.outcome === "retry" || hasMeaningfulOpenRisks) {
    return "medium";
  }

  return "low";
}

export class SupervisorGateway {
  private readonly runs = new Map<string, AuditRun>();
  private readonly router = new SmartRouter();
  private readonly mesh: VerificationMesh;
  private readonly consensusEngine = new ConsensusEngine(verificationPolicy);
  readonly reviews = new HumanReviewStore();

  constructor(
    private readonly provider: ProviderAdapter,
    private readonly store?: FileRunStore,
  ) {
    this.mesh = new VerificationMesh(provider, verificationPolicy);
    this.loadPersistedRuns();
  }

  async submit(task: TaskSubmission): Promise<AuditRun> {
    const runId = createId("run");
    const createdAt = nowIso();
    const routerDecision = this.router.route(task);
    const run: AuditRun = {
      id: runId,
      task,
      routerDecision,
      attempts: [],
      status: "pending",
      createdAt,
      updatedAt: createdAt,
    };

    this.runs.set(runId, run);
    this.persist();

    let feedback: string[] = [];

    for (const attemptNumber of [1, 2, 3] as const) {
      const requests: DomainAgentRequest[] = routerDecision.primaryDomains.map((domain) => ({
        runId,
        task,
        attempt: attemptNumber,
        domain,
        feedback,
      }));

      const responses = await Promise.all(
        requests.map((request) => this.provider.generateDomainResponse(request)),
      );
      const verification = await this.mesh.run(responses, task, attemptNumber);
      const consensus = this.consensusEngine.decide(verification, attemptNumber);
      feedback = this.mesh.createFeedback(verification);

      run.attempts.push(
        buildAttempt(attemptNumber, responses, verification, feedback, consensus),
      );
      run.updatedAt = nowIso();
      run.decisionSummary = this.buildDecisionSummary(run);
      this.persist();

      if (consensus.outcome === "commit") {
        run.status = "committed";
        run.finalSummary = responses.map((response) => response.summary).join(" ");
        run.decisionSummary = this.buildDecisionSummary(run);
        this.persist();
        return run;
      }

      if (consensus.outcome === "rollback") {
        run.status = "rolled_back";
        run.finalSummary = "Release blocked due to a blocking verification or moderation failure.";
        run.decisionSummary = this.buildDecisionSummary(run);
        this.persist();
        return run;
      }
    }

    const latestAttempt = run.attempts.at(-1);
    run.status = "escalated";
    run.finalSummary = "Escalated to human review after three failed verification attempts.";
    run.escalation = this.reviews.open(
      runId,
      latestAttempt?.verification.flatMap((check) => check.notes) ?? [],
      latestAttempt?.feedback ?? [],
    );
    run.updatedAt = nowIso();
    run.decisionSummary = this.buildDecisionSummary(run);
    this.persist();

    return run;
  }

  resolveEscalation(
    escalationId: string,
    input: Omit<HumanResolution, "resolvedAt">,
  ): AuditRun | undefined {
    const packet = this.reviews.resolve(escalationId, input);

    if (!packet) {
      return undefined;
    }

    const run = this.runs.get(packet.runId);

    if (!run) {
      return undefined;
    }

    run.escalation = packet;
    run.status = input.decision === "reject" ? "rolled_back" : "committed";
    run.finalSummary =
      input.decision === "reject"
        ? `Human reviewer ${input.reviewer} rejected the run: ${input.rationale}`
        : `Human reviewer ${input.reviewer} resolved the escalation: ${input.rationale}`;
    run.updatedAt = nowIso();
    run.decisionSummary = this.buildDecisionSummary(run);
    this.persist();

    return run;
  }

  listRuns(): AuditRun[] {
    return [...this.runs.values()].sort((left, right) =>
      left.createdAt < right.createdAt ? 1 : -1,
    );
  }

  getRun(id: string): AuditRun | undefined {
    return this.runs.get(id);
  }

  getProviderName(): string {
    return this.provider.name;
  }

  private loadPersistedRuns(): void {
    if (!this.store) {
      return;
    }

    const persistedRuns = this.store.load();

    for (const run of persistedRuns) {
      for (const attempt of run.attempts) {
        for (const response of attempt.responses) {
          response.keyClaims ??= response.claims ?? [];
          response.evidence ??= response.citations ?? [];
          response.openRisks ??= response.riskFlags ?? [];
          response.recommendedAction ??= "Continue the enterprise review cycle.";
          response.requiresHumanReview ??= false;
        }
      }

      if (!run.decisionSummary && run.attempts.length > 0) {
        run.decisionSummary = this.buildDecisionSummary(run);
      }
      this.runs.set(run.id, run);
    }

    this.reviews.hydrate(
      persistedRuns.flatMap((run) => (run.escalation ? [run.escalation] : [])),
    );
  }

  private persist(): void {
    this.store?.save(this.listRuns());
  }

  private buildDecisionSummary(run: AuditRun): DecisionSummary {
    const latestAttempt = run.attempts.at(-1);

    if (!latestAttempt) {
      return {
        releaseDecision: "retrying",
        riskLevel: "medium",
        recommendedAction: "Start the enterprise review cycle and collect specialist outputs.",
        nextAction: "Wait for the first verification cycle to complete.",
        reasons: ["No verification attempt has completed yet."],
        controlScores: {
          grounding: 0,
          "cross-reference": 0,
          "semantic-policy": 0,
        },
        domainsInScope: run.routerDecision.primaryDomains,
        needsHumanReview: false,
      };
    }

    const releaseDecision = run.status === "committed"
      ? "approved"
      : run.status === "rolled_back"
      ? "blocked"
      : run.status === "escalated"
      ? "escalated"
      : "retrying";
    const recommendedAction =
      latestAttempt.responses.find((response) => response.requiresHumanReview ?? false)?.recommendedAction ??
      latestAttempt.responses[0]?.recommendedAction ??
      "Continue the enterprise review cycle.";
    const nextAction = run.status === "committed"
      ? "Release the case with the current evidence package and maintain audit logging."
      : run.status === "rolled_back"
      ? "Do not release. Remediate the blocking issue and resubmit with stronger evidence."
      : run.status === "escalated"
      ? "Send the case to a human reviewer with the full verification packet."
      : latestAttempt.feedback[0] ?? "Apply verifier remediation and retry the case.";
    const reasons = [
      ...latestAttempt.consensus.rationale.slice(0, 3),
      ...latestAttempt.responses.flatMap((response) => response.openRisks ?? []).slice(0, 3),
    ].slice(0, 5);

    return {
      releaseDecision,
      riskLevel: deriveRiskLevel(run, latestAttempt),
      recommendedAction,
      nextAction,
      reasons,
      controlScores: scoreMap(latestAttempt),
      domainsInScope: run.routerDecision.primaryDomains,
      needsHumanReview:
        run.status === "escalated" ||
        latestAttempt.responses.some((response) => response.requiresHumanReview ?? false),
    };
  }
}
