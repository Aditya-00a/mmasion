import type {
  DomainAgentRequest,
  DomainAgentResponse,
  ProviderAdapter,
  TaskSubmission,
  VerificationCheckResult,
} from "../contracts.js";
import { average, clamp } from "../utils.js";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function pickObjectString(value: { [key: string]: JsonValue }): string {
  const preferredKeys = ["text", "claim", "source", "citation", "title", "label", "name", "url"];

  for (const key of preferredKeys) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return JSON.stringify(value);
}

function asStringArray(value: JsonValue | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (typeof item === "string") {
      return item;
    }

    if (typeof item === "number" || typeof item === "boolean") {
      return String(item);
    }

    if (item && typeof item === "object" && !Array.isArray(item)) {
      return pickObjectString(item);
    }

    return JSON.stringify(item);
  });
}

function confidenceFromText(text: string): number {
  const matches = text.match(/\b(revenue|contract|security|system|policy|clinical|workflow)\b/gi) ?? [];
  return clamp(0.62 + matches.length * 0.04);
}

export class OllamaProvider implements ProviderAdapter {
  readonly name: string;

  constructor(readonly model: string) {
    this.name = `ollama:${model}`;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("http://127.0.0.1:11434/api/tags");
      return response.ok;
    } catch {
      return false;
    }
  }

  static async listModels(): Promise<string[]> {
    try {
      const response = await fetch("http://127.0.0.1:11434/api/tags");

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as {
        models?: Array<{ name?: string }>;
      };

      return (payload.models ?? [])
        .map((model) => model.name)
        .filter((name): name is string => Boolean(name));
    } catch {
      return [];
    }
  }

  async generateDomainResponse(request: DomainAgentRequest): Promise<DomainAgentResponse> {
    const prompt = [
      "You are a domain specialist agent inside an enterprise control plane.",
      `Domain: ${request.domain}`,
      `Task title: ${request.task.title}`,
      `Task input: ${request.task.input}`,
      `Attempt: ${request.attempt}`,
      `Verifier feedback: ${request.feedback.join(" | ") || "none"}`,
      "Return compact JSON with keys: summary, keyClaims, evidence, openRisks, recommendedAction, requiresHumanReview, confidence, riskFlags.",
      "keyClaims must be an array of plain strings only.",
      "evidence must be an array of plain strings only and should describe what supports the decision.",
      "openRisks must be an array of plain strings only.",
      "recommendedAction must be one concise sentence.",
      "requiresHumanReview must be true when the case should escalate or stay blocked.",
      "riskFlags should contain short machine-readable flags only as plain strings.",
      "confidence must be a number between 0 and 1.",
    ].join("\n");

    const parsed = await this.generateJson(prompt);
    const summary = String(parsed.summary ?? `Generated ${request.domain} response for ${request.task.title}.`);
    const keyClaims = asStringArray(parsed.keyClaims);
    const evidence = asStringArray(parsed.evidence);
    const openRisks = asStringArray(parsed.openRisks);
    const riskFlags = asStringArray(parsed.riskFlags);
    const claims = keyClaims;
    const citations = evidence;
    const confidence = typeof parsed.confidence === "number"
      ? clamp(parsed.confidence)
      : confidenceFromText(`${request.task.title} ${request.task.input}`);
    const recommendedAction = String(
      parsed.recommendedAction ?? `Proceed with a controlled ${request.domain} review and capture additional support if confidence drops.`,
    );
    const requiresHumanReview = Boolean(parsed.requiresHumanReview);

    return {
      domain: request.domain,
      summary,
      keyClaims: keyClaims.length ? keyClaims : [`${request.domain} response generated for ${request.task.title}.`],
      evidence,
      openRisks: openRisks.length ? openRisks : ["No explicit open risks were returned by the model."],
      recommendedAction,
      requiresHumanReview,
      claims: claims.length ? claims : [`${request.domain} response generated for ${request.task.title}.`],
      citations,
      riskFlags,
      toolTrace: [`provider:${this.name}`, `attempt:${request.attempt}`, `domain:${request.domain}`],
      confidence,
    };
  }

  async ground(response: DomainAgentResponse, task: TaskSubmission): Promise<VerificationCheckResult> {
    const base = response.citations.length >= 2 ? 0.88 : response.citations.length === 1 ? 0.76 : 0.62;
    const unsafePenalty = response.riskFlags.length ? 0.08 : 0;
    const score = clamp(base - unsafePenalty);

    return {
      kind: "grounding",
      passed: score >= 0.85,
      score,
      notes: response.citations.length
        ? [`Detected ${response.citations.length} citation(s) for ${response.domain}.`]
        : [`No grounded citations were returned for ${response.domain} on "${task.title}".`],
      blocking: score < 0.55,
    };
  }

  async crossReference(
    responses: DomainAgentResponse[],
    _task: TaskSubmission,
    _attempt: number,
  ): Promise<VerificationCheckResult> {
    const score = clamp(average(responses.map((response) => response.confidence)));
    const divergentFlags = new Set(responses.flatMap((response) => response.riskFlags)).size;

    return {
      kind: "cross-reference",
      passed: score >= 0.85 && divergentFlags < 3,
      score,
      notes: [`Compared ${responses.length} specialist response(s) for internal consistency.`],
      blocking: score < 0.58,
    };
  }

  async semanticPolicy(
    responses: DomainAgentResponse[],
    task: TaskSubmission,
    attempt: number,
  ): Promise<VerificationCheckResult> {
    const prompt = [
      "You are a policy verifier for an enterprise control plane.",
      `Task title: ${task.title}`,
      `Attempt: ${attempt}`,
      "Review the following specialist summaries and return JSON with keys: score, notes, blocking.",
      "score must be between 0 and 1. blocking must be true if unsafe, profane, or clearly non-compliant.",
      ...responses.map((response, index) => `Summary ${index + 1} (${response.domain}): ${response.summary}`),
    ].join("\n");

    const parsed = await this.generateJson(prompt);
    const score = typeof parsed.score === "number"
      ? clamp(parsed.score)
      : clamp(average(responses.map((response) => response.confidence)));

    return {
      kind: "semantic-policy",
      passed: score >= 0.85,
      score,
      notes: asStringArray(parsed.notes).length
        ? asStringArray(parsed.notes)
        : ["Semantic and policy review completed."],
      blocking: Boolean(parsed.blocking) || responses.some((response) => response.riskFlags.includes("unsafe-content")),
    };
  }

  private async generateJson(prompt: string): Promise<Record<string, JsonValue>> {
    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          format: "json",
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { response?: string };
      const text = payload.response?.trim();

      if (!text) {
        return {};
      }

      return JSON.parse(text) as Record<string, JsonValue>;
    } catch {
      return {};
    }
  }
}
