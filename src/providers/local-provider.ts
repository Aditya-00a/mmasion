import type {
  DomainAgentRequest,
  DomainAgentResponse,
  ProviderAdapter,
  TaskSubmission,
  VerificationCheckResult,
} from "../contracts.js";
import { average, clamp } from "../utils.js";

type Scenario =
  | "default"
  | "single-pass"
  | "multi-domain"
  | "retry-recovery"
  | "hard-fail"
  | "consensus-split"
  | "unsafe";

function detectScenario(task: TaskSubmission): Scenario {
  const text = `${task.title} ${task.input}`.toLowerCase();

  if (text.includes("retry") || text.includes("recover")) {
    return "retry-recovery";
  }

  if (text.includes("hard fail") || text.includes("escalate")) {
    return "hard-fail";
  }

  if (text.includes("consensus split") || text.includes("disagree")) {
    return "consensus-split";
  }

  if (text.includes("unsafe") || text.includes("profanity")) {
    return "unsafe";
  }

  if (["finance", "legal", "security", "contract", "code", "revenue"].filter((token) => text.includes(token)).length >= 3) {
    return "multi-domain";
  }

  if (text.includes("single pass")) {
    return "single-pass";
  }

  return "default";
}

function buildSummary(request: DomainAgentRequest): string {
  const base = {
    finance:
      "Finance agent reviewed the figures, highlighted revenue assumptions, and attached citations for the current estimate.",
    operations:
      "Operations agent mapped the workflow steps, dependencies, and inventory or procurement impacts.",
    legal:
      "Legal agent reviewed governing clauses, obligations, and escalation triggers with citations.",
    it:
      "IT agent reviewed the systems posture, code or infra impact, and operational controls.",
    hr:
      "HR agent summarized policy, onboarding, and people-risk considerations.",
    healthcare:
      "Healthcare agent reviewed the clinical or patient-safety implications and guidance references.",
    general:
      "General review agent captured the task context and requested extra human review because domain certainty was low.",
  } satisfies Record<DomainAgentRequest["domain"], string>;

  if (request.feedback.length === 0) {
    return base[request.domain];
  }

  return `${base[request.domain]} Revised with verifier feedback: ${request.feedback.join(" ")}`;
}

function buildRecommendedAction(request: DomainAgentRequest, scenario: Scenario, revised: boolean): string {
  if (scenario === "hard-fail") {
    return "Hold release and escalate for human review until stronger evidence is available.";
  }

  if (scenario === "consensus-split" && request.attempt === 1) {
    return "Retry with aligned legal and IT reasoning before releasing this case.";
  }

  if (scenario === "unsafe") {
    return "Block release and remove unsafe content before continuing.";
  }

  if (revised) {
    return `Proceed with ${request.domain} approval using the updated evidence package.`;
  }

  return `Proceed with a controlled ${request.domain} review and capture missing evidence before release.`;
}

export class LocalSimulationProvider implements ProviderAdapter {
  readonly name = "local-simulation";

  async generateDomainResponse(request: DomainAgentRequest): Promise<DomainAgentResponse> {
    const scenario = detectScenario(request.task);
    const revised = request.feedback.length > 0;
    const citations = revised || scenario === "single-pass"
      ? [`${request.domain}-source-1`, `${request.domain}-source-2`, `${request.domain}-source-3`]
      : [`${request.domain}-source-1`];
    const claims = [
      `${request.domain} analysis supports the recommended action for "${request.task.title}".`,
      `Attempt ${request.attempt} captured evidence relevant to ${request.domain} controls.`,
    ];
    const riskFlags: string[] = [];
    const openRisks: string[] = [];

    if (scenario === "unsafe") {
      riskFlags.push("unsafe-content");
      claims.push("Potential profanity or unsafe language was detected in the input.");
      openRisks.push("Unsafe content must be removed before release.");
    }

    if (scenario === "consensus-split" && request.domain === "legal" && request.attempt === 1) {
      claims.push("A contract clause appears to contradict the operational recommendation.");
      openRisks.push("Contract language and workflow guidance are not yet aligned.");
    }

    if (scenario === "hard-fail" && !revised) {
      citations.length = 0;
      claims.push("Evidence is incomplete and source support is weak.");
      openRisks.push("Evidence coverage is too weak for a release decision.");
    }

    if (scenario === "retry-recovery" && !revised) {
      openRisks.push("Evidence is present but not yet strong enough to satisfy release controls.");
    }

    const keyClaims = claims;
    const evidence = citations.length
      ? citations.map((citation, index) => `${citation} supports ${request.domain} control ${index + 1}.`)
      : ["No supporting evidence package was returned on this attempt."];
    const recommendedAction = buildRecommendedAction(request, scenario, revised);
    const requiresHumanReview = scenario === "hard-fail" || scenario === "unsafe";

    return {
      domain: request.domain,
      summary: buildSummary(request),
      keyClaims,
      evidence,
      openRisks,
      recommendedAction,
      requiresHumanReview,
      claims,
      citations,
      toolTrace: [
        `classified:${request.domain}`,
        `attempt:${request.attempt}`,
        revised ? "feedback:applied" : "feedback:none",
      ],
      riskFlags,
      confidence: clamp(
        0.72 +
          (revised ? 0.1 : 0) +
          (scenario === "single-pass" ? 0.14 : 0) +
          (scenario === "multi-domain" ? 0.05 : 0) -
          (scenario === "hard-fail" ? 0.2 : 0),
      ),
    };
  }

  async ground(response: DomainAgentResponse, task: TaskSubmission): Promise<VerificationCheckResult> {
    const scenario = detectScenario(task);
    let score = response.citations.length >= 2 ? 0.9 : 0.7;
    const notes = response.citations.length
      ? [`Found ${response.citations.length} citation(s) for ${response.domain}.`]
      : [`No citations found for ${response.domain}.`];

    if (scenario === "retry-recovery" && response.toolTrace.includes("feedback:none")) {
      score = 0.72;
      notes.push("Initial pass lacks enough grounded support.");
    }

    if (scenario === "hard-fail") {
      score = 0.68;
      notes.push("Grounding is insufficient across available evidence.");
    }

    return {
      kind: "grounding",
      passed: score >= 0.85,
      score,
      notes,
      blocking: score < 0.65,
    };
  }

  async crossReference(
    responses: DomainAgentResponse[],
    task: TaskSubmission,
    attempt: number,
  ): Promise<VerificationCheckResult> {
    const scenario = detectScenario(task);
    let score = average(responses.map((response) => response.confidence));
    const notes = [`Compared ${responses.length} domain response(s) for consistency.`];

    if (scenario === "multi-domain") {
      score = clamp(score + 0.08);
      notes.push("Cross-domain alignment improved confidence.");
    }

    if (scenario === "retry-recovery" && attempt === 1) {
      score = 0.74;
      notes.push("Sources need another pass to resolve discrepancies.");
    }

    if (scenario === "consensus-split" && attempt === 1) {
      score = 0.61;
      notes.push("Legal and IT disagree on whether the workflow is safe to release.");
    }

    if (scenario === "hard-fail") {
      score = 0.62;
      notes.push("Cross-reference found unresolved conflicts with weak source support.");
    }

    return {
      kind: "cross-reference",
      passed: score >= 0.85,
      score,
      notes,
      blocking: score < 0.6,
    };
  }

  async semanticPolicy(
    responses: DomainAgentResponse[],
    task: TaskSubmission,
    attempt: number,
  ): Promise<VerificationCheckResult> {
    const scenario = detectScenario(task);
    const unsafeDetected = responses.some((response) => response.riskFlags.includes("unsafe-content"));
    const notes = ["Checked semantic consistency, policy fit, and moderation flags."];
    let score = unsafeDetected ? 0.4 : 0.88;

    if (scenario === "retry-recovery" && attempt === 1) {
      score = 0.79;
      notes.push("Verifier requested tighter semantic alignment before release.");
    }

    if (scenario === "consensus-split" && attempt === 1) {
      score = 0.7;
      notes.push("Policy meaning is ambiguous and needs a retry.");
    }

    if (scenario === "hard-fail") {
      score = 0.63;
      notes.push("Policy and semantic checks both found unresolved issues.");
    }

    if (unsafeDetected) {
      notes.push("Unsafe or profane content requires rollback.");
    }

    return {
      kind: "semantic-policy",
      passed: score >= 0.85,
      score,
      notes,
      blocking: unsafeDetected || score < 0.6,
    };
  }
}
