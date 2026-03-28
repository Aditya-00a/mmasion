import type {
  AuditAttempt,
  ConsensusDecision,
  DomainAgentResponse,
  ProviderAdapter,
  TaskSubmission,
  VerificationCheckResult,
  VerificationPolicy,
} from "./contracts.js";

export class VerificationMesh {
  constructor(
    private readonly provider: ProviderAdapter,
    private readonly policy: VerificationPolicy,
  ) {}

  async run(
    responses: DomainAgentResponse[],
    task: TaskSubmission,
    attempt: 1 | 2 | 3,
  ): Promise<VerificationCheckResult[]> {
    const groundingChecks = await Promise.all(
      responses.map((response) => this.provider.ground(response, task)),
    );
    const groundingAverage =
      groundingChecks.reduce((sum, check) => sum + check.score, 0) / groundingChecks.length;

    const crossReference = await this.provider.crossReference(responses, task, attempt);
    const semanticPolicy = await this.provider.semanticPolicy(responses, task, attempt);

    const checks: VerificationCheckResult[] = [
      {
        kind: "grounding",
        passed: groundingAverage >= this.policy.groundingThresholds[attempt],
        score: groundingAverage,
        notes: groundingChecks.flatMap((check) => check.notes),
        blocking: groundingChecks.some((check) => check.blocking),
      },
      {
        ...crossReference,
        passed: crossReference.score >= this.policy.crossReferenceThresholds[attempt],
      },
      {
        ...semanticPolicy,
        passed: semanticPolicy.score >= this.policy.semanticThresholds[attempt],
      },
    ];

    return checks;
  }

  createFeedback(checks: VerificationCheckResult[]): string[] {
    return checks
      .filter((check) => !check.passed)
      .map((check) => {
        if (check.kind === "grounding") {
          return "Add stronger citations and grounded evidence for every critical claim.";
        }

        if (check.kind === "cross-reference") {
          return "Resolve source conflicts and align domain outputs before release.";
        }

        return "Tighten semantic consistency, moderation handling, and policy reasoning.";
      });
  }
}

export class ConsensusEngine {
  constructor(private readonly policy: VerificationPolicy) {}

  decide(checks: VerificationCheckResult[], attempt: 1 | 2 | 3): ConsensusDecision {
    const passCount = checks.filter((check) => check.passed).length;
    const agreement = passCount / checks.length;
    const blockingFailure = checks.some((check) => check.blocking);
    const rationale = checks.flatMap((check) => check.notes);

    if (blockingFailure && this.policy.rollbackOnBlockingFailure) {
      return {
        outcome: "rollback",
        agreement,
        rationale: ["Blocking verification failure detected.", ...rationale],
      };
    }

    if (agreement >= this.policy.commitAgreementThreshold && passCount === checks.length) {
      return {
        outcome: "commit",
        agreement,
        rationale: ["All verification checks passed release policy.", ...rationale],
      };
    }

    if (attempt === 3) {
      return {
        outcome: "escalate",
        agreement,
        rationale: ["Three attempts exhausted without consensus.", ...rationale],
      };
    }

    return {
      outcome: "retry",
      agreement,
      rationale: ["Verification needs another attempt with structured feedback.", ...rationale],
    };
  }
}

export function buildAttempt(
  attemptNumber: number,
  responses: DomainAgentResponse[],
  verification: VerificationCheckResult[],
  feedback: string[],
  consensus: ConsensusDecision,
): AuditAttempt {
  return {
    attemptNumber,
    responses,
    verification,
    feedback,
    consensus,
  };
}
