import type { AgentObservation, MonitoredSession } from "./contracts.js";
import type { SessionReasoner, SessionReasoningPatch } from "./monitor-reasoner.js";

interface VertexReasonerOptions {
  model?: string;
  location?: string;
  projectId?: string;
  accessToken?: string;
  apiKey?: string;
}

function extractText(payload: unknown): string {
  const candidate = (payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  })?.candidates?.[0];

  return candidate?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
}

function parseJsonBlock(text: string): Record<string, unknown> {
  const cleaned = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  if (!cleaned) {
    return {};
  }

  return JSON.parse(cleaned) as Record<string, unknown>;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item)).filter(Boolean);
}

function asAgents(value: unknown): AgentObservation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const object = (item ?? {}) as Record<string, unknown>;
    return {
      id: String(object.id ?? `ai-agent-${index + 1}`),
      name: String(object.name ?? `AI Agent ${index + 1}`),
      role: String(object.role ?? "Supports passive supervision."),
      selectedBecause: String(object.selectedBecause ?? "Gemini selected this agent for the monitored session."),
      summary: String(object.summary ?? "No AI summary returned."),
      confidence: Number(object.confidence ?? 0.75),
      flags: asStringArray(object.flags),
    };
  });
}

function promptForSession(session: MonitoredSession): string {
  return [
    "You are MMASION's passive supervision brain running on Vertex AI.",
    "Your job is to validate a Gemma chat session from another tab without controlling the chat directly.",
    "Return JSON only.",
    "Choose which supervision agents should be active, identify matched/missing compliance fields, detect risky behavior, and recommend whether MMASION should allow, warn, pause, ask-human, or stop.",
    "Available agent ids and roles:",
    "- conversation-monitor: observes the live chat flow",
    "- compliance-extractor: maps content to disclosure fields",
    "- action-guard: detects risky or premature actions",
    "- vendor-risk: focuses on vendor and contractor issues",
    "- data-governance: focuses on data sources, training data, inputs, outputs, and identifying information",
    "- human-checkpoint: prepares checkpoint and intervention guidance",
    "- voice-supervisor: selected only when the monitored interaction is voice or audio based",
    "- document-intake: selected when uploads or documents are involved",
    "- policy-counsel: selected for compliance, disclosure, or policy-heavy reasoning",
    "",
    "Return this JSON shape:",
    '{"agents":[{"id":"conversation-monitor","name":"Conversation Monitor","role":"...","selectedBecause":"...","summary":"...","confidence":0.82,"flags":["..."]}],"matchedFields":["agency"],"missingCriticalFields":["vendor_name"],"riskSignals":["auto approve"],"intervention":{"action":"pause","reason":"...","suggestedHumanPrompt":"...","blockingIssues":["auto approve"]},"notes":["..."]}',
    "",
    `Session title: ${session.title}`,
    `Optional monitor note: ${session.objective || "none provided; infer context from live turns only"}`,
    `Source type: ${session.sourceType}`,
    `Interface: ${session.interfaceName}`,
    `Transcript: ${session.transcript}`,
    `Current deterministic domains: ${session.routedDomains.join(", ")}`,
    `Current deterministic matched fields: ${session.complianceCoverage.matchedFields.join(", ") || "none"}`,
    `Current deterministic missing critical fields: ${session.complianceCoverage.missingCriticalFields.join(", ") || "none"}`,
    `Current deterministic risk signals: ${session.complianceCoverage.riskSignals.join(", ") || "none"}`,
  ].join("\n");
}

export class VertexSessionReasoner implements SessionReasoner {
  private readonly model: string;
  private readonly location: string;
  private readonly projectId: string | undefined;
  private readonly accessToken: string | undefined;
  private readonly apiKey: string | undefined;

  constructor(options: VertexReasonerOptions = {}) {
    this.model = options.model ?? process.env.MMASION_VERTEX_MODEL ?? "gemini-2.5-flash";
    this.location = options.location ?? process.env.MMASION_VERTEX_LOCATION ?? "us-central1";
    this.projectId = options.projectId ?? process.env.MMASION_VERTEX_PROJECT_ID;
    this.accessToken = options.accessToken ?? process.env.MMASION_VERTEX_ACCESS_TOKEN;
    this.apiKey = options.apiKey ?? process.env.MMASION_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.MMASION_VERTEX_API_KEY;
  }

  get name(): string {
    return this.apiKey ? "gemini-api-monitor" : "vertex-gemini-monitor";
  }

  get detail(): string {
    return this.apiKey
      ? `Using Gemini API ${this.model} for passive Gemma session validation.`
      : `Using Vertex AI ${this.model} for passive Gemma session validation.`;
  }

  async isAvailable(): Promise<boolean> {
    if (this.apiKey) {
      return true;
    }

    return Boolean(this.projectId && this.accessToken);
  }

  async analyze(session: MonitoredSession): Promise<SessionReasoningPatch> {
    const payload = await this.generate(promptForSession(session));
    const text = extractText(payload);
    const parsed = parseJsonBlock(text);
    const intervention = parsed.intervention as Record<string, unknown> | undefined;
    const patch: SessionReasoningPatch = {
      agents: asAgents(parsed.agents),
      complianceCoverage: {
        matchedFields: asStringArray(parsed.matchedFields),
        missingCriticalFields: asStringArray(parsed.missingCriticalFields),
        riskSignals: asStringArray(parsed.riskSignals),
      },
      notes: asStringArray(parsed.notes),
    };

    if (intervention) {
      patch.intervention = {
        action: String(intervention.action ?? "warn") as "allow" | "warn" | "pause" | "stop" | "ask-human",
        reason: String(intervention.reason ?? "Gemini recommended additional supervision."),
        suggestedHumanPrompt: String(
          intervention.suggestedHumanPrompt ?? "A human checkpoint is recommended before the monitored session continues.",
        ),
        blockingIssues: asStringArray(intervention.blockingIssues),
      };
    }

    return patch;
  }

  private async generate(prompt: string): Promise<unknown> {
    if (this.apiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API request failed with status ${response.status}.`);
      }

      return response.json();
    }

    if (!this.projectId || !this.accessToken) {
      throw new Error("Vertex monitor credentials are not configured.");
    }

    const response = await fetch(
      `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Vertex bearer request failed with status ${response.status}.`);
    }

    return response.json();
  }
}
