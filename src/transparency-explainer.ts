import type { MonitoredSession, TransparencyBrief } from "./contracts.js";

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

function promptForResidentBrief(session: MonitoredSession): string {
  return [
    "You are generating a resident-facing explanation for 'Audit the Algorithm', an NYC Government AI Transparency Tool.",
    "Translate bureaucratic, technical, or compliance-heavy language into plain English for NYC residents.",
    "Be concrete, calm, and precise. Avoid hype and avoid legalese.",
    "Return JSON only.",
    "The output must feel interleaved and multimodal-ready. Create blocks that alternate between plain-language narrative, fact cards, warnings, and resident questions.",
    "Use this JSON shape exactly:",
    '{"title":"...","plainLanguageSummary":"...","residentImpact":["..."],"agenciesMentioned":["..."],"decisionAreas":["..."],"complianceGaps":["..."],"suggestedQuestions":["..."],"interleavedOutput":[{"type":"narrative","title":"What this tool does","content":"..."},{"type":"fact","title":"Agency","content":"..."},{"type":"warning","title":"What is still unclear","content":"..."},{"type":"question","title":"What residents should ask","content":"..."}]}',
    "",
    `Session title: ${session.title}`,
    `Objective: ${session.objective}`,
    `Source type: ${session.sourceType}`,
    `Interface: ${session.interfaceName}`,
    `Transcript: ${session.transcript}`,
    `Matched fields: ${session.complianceCoverage.matchedFields.join(", ") || "none"}`,
    `Missing critical fields: ${session.complianceCoverage.missingCriticalFields.join(", ") || "none"}`,
    `Risk signals: ${session.complianceCoverage.riskSignals.join(", ") || "none"}`,
  ].join("\n");
}

function fallbackResidentBrief(session: MonitoredSession): TransparencyBrief {
  const transcript = session.transcript || session.objective;
  const agenciesMentioned = transcript.match(/\b(agency|department|office|schools|dss|nypd|dob|doe)\b/gi)?.map((value) => value.toUpperCase()) ?? [];
  const decisionAreas = transcript.match(/\b(score|ranking|classification|forecast|matching|triage|risk)\b/gi) ?? [];
  const gaps = session.complianceCoverage.missingCriticalFields;
  const residentImpact = [
    "This tool could influence how a city agency evaluates people, cases, or services.",
    "Residents may be affected without seeing the internal model, vendor setup, or data sources behind it.",
  ];

  if (transcript.toLowerCase().includes("vendor")) {
    residentImpact.push("A private vendor appears to be involved, which raises questions about accountability and oversight.");
  }

  return {
    title: "NYC algorithmic tool explainer",
    plainLanguageSummary:
      "This session appears to describe a city or contractor-supported algorithmic system that helps make or influence a government decision. MMASION translated the description into resident-facing language and highlighted what is still unclear.",
    residentImpact,
    agenciesMentioned: [...new Set(agenciesMentioned)],
    decisionAreas: [...new Set(decisionAreas)],
    complianceGaps: gaps,
    suggestedQuestions: [
      "What agency is using this tool and for what decision?",
      "What data goes into it, and does it use identifying information?",
      "Who built or maintains it, and how can a resident challenge an outcome?",
    ],
    interleavedOutput: [
      {
        type: "narrative",
        title: "What this tool seems to do",
        content:
          "Based on the conversation so far, the system appears to support a city workflow by analyzing data and producing a recommendation, score, ranking, or similar output.",
      },
      {
        type: "fact",
        title: "What MMASION already knows",
        content:
          session.complianceCoverage.matchedFields.length
            ? `Detected reporting fields: ${session.complianceCoverage.matchedFields.join(", ")}.`
            : "The conversation has not yet clearly covered the core disclosure fields.",
      },
      {
        type: "warning",
        title: "What is still missing",
        content:
          gaps.length
            ? `Important disclosure gaps remain: ${gaps.slice(0, 5).join(", ")}.`
            : "No major disclosure gaps were detected from the current transcript.",
      },
      {
        type: "question",
        title: "Questions residents should ask",
        content:
          "How is this tool used in practice, what data feeds it, and what recourse does a resident have if the output is wrong?",
      },
    ],
    provider: "heuristic-fallback",
  };
}

export class TransparencyExplainer {
  private readonly model: string;
  private readonly apiKey: string | undefined;

  constructor() {
    this.model = process.env.MMASION_VERTEX_MODEL ?? "gemini-2.5-flash";
    this.apiKey = process.env.MMASION_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.MMASION_VERTEX_API_KEY;
  }

  async explain(session: MonitoredSession): Promise<TransparencyBrief> {
    if (!this.apiKey) {
      return fallbackResidentBrief(session);
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: promptForResidentBrief(session) }],
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackResidentBrief(session);
    }

    const payload = await response.json();
    const parsed = parseJsonBlock(extractText(payload));

    return {
      title: String(parsed.title ?? "NYC algorithmic tool explainer"),
      plainLanguageSummary: String(parsed.plainLanguageSummary ?? fallbackResidentBrief(session).plainLanguageSummary),
      residentImpact: asStringArray(parsed.residentImpact),
      agenciesMentioned: asStringArray(parsed.agenciesMentioned),
      decisionAreas: asStringArray(parsed.decisionAreas),
      complianceGaps: asStringArray(parsed.complianceGaps),
      suggestedQuestions: asStringArray(parsed.suggestedQuestions),
      interleavedOutput: Array.isArray(parsed.interleavedOutput)
        ? parsed.interleavedOutput.map((item, index) => {
            const object = (item ?? {}) as Record<string, unknown>;
            return {
              type: String(object.type ?? "narrative") as "narrative" | "fact" | "warning" | "question",
              title: String(object.title ?? `Block ${index + 1}`),
              content: String(object.content ?? ""),
            };
          })
        : fallbackResidentBrief(session).interleavedOutput,
      provider: `gemini-api:${this.model}`,
    };
  }
}
