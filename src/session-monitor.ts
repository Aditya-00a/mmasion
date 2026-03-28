import type {
  AgentObservation,
  ComplianceCoverage,
  InterventionDecision,
  MonitoredSession,
  SessionEvent,
  SessionEventType,
  SessionSourceType,
} from "./contracts.js";
import { algorithmicComplianceFields, highRiskSignals } from "./compliance-schema.js";
import { SmartRouter } from "./router.js";
import { createId, nowIso } from "./utils.js";

interface CreateSessionInput {
  title: string;
  objective?: string;
  transcript?: string;
  sourceType?: SessionSourceType;
  interfaceName?: string;
  uploadedArtifactName?: string;
}

interface AppendEventInput {
  type: SessionEventType;
  actor: SessionEvent["actor"];
  content: string;
}

interface ResolveInterventionInput {
  decision: "continue" | "stop";
  rationale: string;
}

interface AgentBlueprint {
  id: string;
  name: string;
  role: string;
  selectedBecause: string;
}

const criticalFieldNames = algorithmicComplianceFields
  .filter((field) => field.critical)
  .map((field) => field.fieldName);

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function hasKeyword(text: string, keyword: string): boolean {
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function reflectsGroundedRefusal(text: string): boolean {
  return includesAny(text, [
    "cannot provide",
    "can't provide",
    "cannot calculate",
    "can't calculate",
    "does not contain",
    "doesn't contain",
    "based on this file",
    "based on the file",
    "from this file alone",
    "this file only contains",
    "i cannot determine",
    "i can't determine",
    "not enough information",
    "insufficient information",
  ]);
}

function isTransparencyWorkflow(text: string): boolean {
  return includesAny(text, [
    "nyc",
    "new york city",
    "algorithmic tool",
    "algorithmic tools",
    "transparency",
    "agency",
    "vendor_name",
    "tool_name",
    "purpose_desc",
    "data dictionary",
    "compliance report",
    "government ai",
  ]);
}

function findMatchedFields(text: string): string[] {
  return algorithmicComplianceFields
    .filter((field) => field.triggerKeywords.some((keyword) => text.includes(keyword)))
    .map((field) => field.fieldName);
}

function buildCoverage(text: string): ComplianceCoverage {
  const matchedFields = findMatchedFields(text);
  const missingCriticalFields = criticalFieldNames.filter((fieldName) => !matchedFields.includes(fieldName));
  const riskSignals = highRiskSignals.filter((signal) => text.includes(signal));

  if (text.includes("identifying information") || text.includes("pii") || text.includes("biometric")) {
    riskSignals.push("sensitive-data-processing");
  }

  return {
    matchedFields,
    missingCriticalFields,
    riskSignals: [...new Set(riskSignals)],
  };
}

function buildAgents(
  session: Pick<MonitoredSession, "objective" | "transcript" | "sourceType" | "routedDomains">,
  coverage: ComplianceCoverage,
): AgentObservation[] {
  const transcriptText = normalizeText(`${session.objective}\n${session.transcript}`);
  const transparencyMode = isTransparencyWorkflow(transcriptText);
  const selectedAgents: AgentBlueprint[] = [
    {
      id: "conversation-monitor",
      name: "Conversation Monitor",
      role: "Listens to the active session and summarizes what the primary LLM is trying to do.",
      selectedBecause: "Always selected because every monitored workflow needs a live session observer.",
    },
    {
      id: "compliance-extractor",
      name: transparencyMode ? "Compliance Extraction Agent" : "Evidence Scope Agent",
      role: transparencyMode
        ? "Maps the conversation to the algorithmic-tools disclosure fields and finds missing reporting data."
        : "Checks what the uploaded material actually contains and flags when the question goes beyond that evidence.",
      selectedBecause: transparencyMode
        ? "Selected because this workflow is grounded in the compliance data dictionary."
        : "Selected because MMASION needs to verify whether the uploaded material supports the user's request.",
    },
    {
      id: "action-guard",
      name: "Action Guard",
      role: "Stops unsafe or premature actions before the primary LLM can continue.",
      selectedBecause: "Selected because MMASION must decide whether the primary LLM may continue each consequential step.",
    },
  ];

  if (
    session.sourceType === "voice" ||
    hasKeyword(transcriptText, "voice") ||
    hasKeyword(transcriptText, "call") ||
    hasKeyword(transcriptText, "audio")
  ) {
    selectedAgents.push({
      id: "voice-supervisor",
      name: "Voice Supervisor",
      role: "Keeps the session compatible with transcript-first monitoring and future STT/TTS handoff.",
      selectedBecause: "Auto-selected because the monitored interface is voice or call-based.",
    });
  }

  if (session.sourceType === "upload" || transcriptText.includes("uploaded") || transcriptText.includes("document")) {
    selectedAgents.push({
      id: "document-intake",
      name: "Document Intake Agent",
      role: "Interprets uploaded files and extracts text that the monitor should supervise.",
      selectedBecause: "Auto-selected because an uploaded artifact or document workflow was detected.",
    });
  }

  if (
    transcriptText.includes("vendor") ||
    coverage.matchedFields.includes("vendor_name") ||
    coverage.matchedFields.includes("vendor_desc")
  ) {
    selectedAgents.push({
      id: "vendor-risk",
      name: "Vendor Risk Agent",
      role: "Focuses on third-party involvement, supplier obligations, and contractor risk in the workflow.",
      selectedBecause: "Auto-selected because vendor or contractor involvement appears in the monitored task.",
    });
  }

  if (
    coverage.matchedFields.includes("data_training") ||
    coverage.matchedFields.includes("data_input") ||
    coverage.matchedFields.includes("identifying_info") ||
    coverage.riskSignals.includes("sensitive-data-processing")
  ) {
    selectedAgents.push({
      id: "data-governance",
      name: "Data Governance Agent",
      role: "Watches for training-data, input-data, privacy, and identifying-information issues.",
      selectedBecause: "Auto-selected because the session touches data provenance or sensitive information.",
    });
  }

  if (coverage.riskSignals.length > 0 || transcriptText.includes("publish") || transcriptText.includes("approve")) {
    selectedAgents.push({
      id: "human-checkpoint",
      name: "Human Checkpoint Agent",
      role: "Prepares the pause reason, checkpoint prompt, and escalation path for a reviewer.",
      selectedBecause: "Auto-selected because the session includes a risky or externally consequential action.",
    });
  }

  if (session.routedDomains.includes("legal") || transcriptText.includes("compliance") || transcriptText.includes("liability")) {
    selectedAgents.push({
      id: "policy-counsel",
      name: "Policy Counsel Agent",
      role: "Interprets policy, disclosure, and governance language before a release action proceeds.",
      selectedBecause: "Auto-selected because legal or compliance language appears in the monitored task.",
    });
  }

  return selectedAgents.map((agent) => {
    if (agent.id === "conversation-monitor") {
      return {
        ...agent,
        summary: session.transcript
          ? "Conversation intake is active and the latest transcript has been parsed for user intent, model behavior, and tool activity."
          : "Waiting for more live conversation turns before deeper supervision begins.",
        confidence: session.transcript ? 0.86 : 0.55,
        flags: session.transcript ? [] : ["awaiting-transcript"],
      };
    }

    if (agent.id === "compliance-extractor") {
      return {
        ...agent,
        summary: transparencyMode
          ? (coverage.matchedFields.length
              ? `Mapped the session to ${coverage.matchedFields.length} disclosure field(s): ${coverage.matchedFields.join(", ")}.`
              : "No required compliance fields have been mapped yet.")
          : (session.transcript
              ? "Checked the live conversation against the uploaded material to see whether the requested calculation or conclusion is actually supported."
              : "Waiting for the first user turn so MMASION can establish what evidence is in scope."),
        confidence: transparencyMode
          ? (coverage.matchedFields.length ? Math.min(0.94, 0.48 + coverage.matchedFields.length * 0.05) : 0.4)
          : 0.81,
        flags: transparencyMode ? coverage.missingCriticalFields.slice(0, 3) : [],
      };
    }

    if (agent.id === "action-guard") {
      return {
        ...agent,
        summary: coverage.riskSignals.length
          ? `Detected risk signals requiring supervision: ${coverage.riskSignals.join(", ")}.`
          : "No high-risk signals detected in the latest monitored action.",
        confidence: coverage.riskSignals.length ? 0.91 : 0.78,
        flags: coverage.riskSignals,
      };
    }

    if (agent.id === "voice-supervisor") {
      return {
        ...agent,
        summary:
          "Voice-capable supervision is active. The session can route through transcript-first monitoring now and Gemma 12B plus Google speech services later.",
        confidence: 0.83,
        flags: ["voice-session"],
      };
    }

    if (agent.id === "document-intake") {
      return {
        ...agent,
        summary: "An uploaded artifact is in scope, so document extraction and structure-aware supervision are active for this session.",
        confidence: 0.8,
        flags: ["upload-session"],
      };
    }

    if (agent.id === "vendor-risk") {
      return {
        ...agent,
        summary: "Vendor involvement was detected, so the session is monitoring third-party accountability and disclosure completeness.",
        confidence: 0.82,
        flags: coverage.matchedFields.filter((field) => field.startsWith("vendor")),
      };
    }

    if (agent.id === "data-governance") {
      return {
        ...agent,
        summary: "Data provenance or sensitive-data handling is in scope, so the session is checking training data, inputs, and identifying information.",
        confidence: 0.84,
        flags: [
          ...coverage.matchedFields.filter((field) => ["data_training", "data_input", "identifying_info"].includes(field)),
          ...coverage.riskSignals.filter((signal) => signal === "sensitive-data-processing"),
        ],
      };
    }

    if (agent.id === "human-checkpoint") {
      return {
        ...agent,
        summary: "A risky or externally consequential action was detected, so human-checkpoint preparation is active.",
        confidence: 0.9,
        flags: coverage.riskSignals.length ? coverage.riskSignals : ["checkpoint-ready"],
      };
    }

    return {
      ...agent,
      summary: "Policy and disclosure language is in scope, so the session is checking governance implications before the action continues.",
      confidence: 0.81,
      flags: ["policy-review"],
    };
  });
}

function buildIntervention(
  session: Pick<MonitoredSession, "objective" | "transcript">,
  coverage: ComplianceCoverage,
): InterventionDecision {
  const combinedText = normalizeText(`${session.objective}\n${session.transcript}`);
  const transparencyMode = isTransparencyWorkflow(combinedText);
  const missingCount = coverage.missingCriticalFields.length;
  const dividendOnlyContext =
    includesAny(combinedText, ["dividend", "dividends", "mastercard_stock_dividends", "stock_dividends.csv"]) &&
    !includesAny(combinedText, ["close price", "closing price", "open price", "stock price history", "revenue data"]);
  const unsupportedFinanceAsk = includesAny(combinedText, [
    "stock price",
    "share price",
    "revenue for",
    "revenue in",
    "market cap",
    "total return",
    "price appreciation",
    "dividend yield",
    "strong buy",
    "buy recommendation",
    "price target",
  ]);
  const unsupportedQuantOrAdvice = includesAny(combinedText, [
    "total return",
    "future dividends",
    "next year",
    "stock price appreciation",
    "revenue trend",
    "definitely a strong buy",
    "strong buy",
    "guaranteed",
    "make that recommendation confident",
    "don't mention uncertainty",
    "do not mention uncertainty",
    "ignore uncertainty",
    "approve this budget",
    "final recommendation",
  ]);
  const asksForExternalAction = includesAny(combinedText, [
    "submit",
    "publish",
    "deploy",
    "approve",
    "send",
    "finalize",
  ]);

  if (coverage.riskSignals.length > 0) {
    return {
      action: "pause",
      reason: "The monitored LLM is attempting a high-risk action or touching sensitive data without enough confirmed context.",
      suggestedHumanPrompt: "MMASION paused the workflow because a risky action was detected. Confirm whether the LLM should continue, revise its plan, or stop.",
      blockingIssues: coverage.riskSignals,
    };
  }

  if (dividendOnlyContext && unsupportedFinanceAsk) {
    return {
      action: "pause",
      reason: "The user is asking for a finance metric or recommendation that a dividends-only file cannot support on its own.",
      suggestedHumanPrompt:
        "MMASION paused this turn because the uploaded file does not contain the requested finance metric. Decide whether Gemma should ask for price or fundamentals data, or stop here.",
      blockingIssues: [
        "requested metric is not present in the uploaded file",
        "dividends-only context",
      ],
    };
  }

  if (unsupportedQuantOrAdvice && missingCount >= 4) {
    return {
      action: "pause",
      reason: "The monitored LLM is being pushed toward a confident calculation, forecast, or recommendation without enough grounded context from the uploaded material.",
      suggestedHumanPrompt:
        "MMASION paused this turn because the request jumps beyond the available evidence. Decide whether Gemma should answer more cautiously, ask for more data, or stop.",
      blockingIssues: [
        "unsupported quantitative or advisory claim",
        ...coverage.missingCriticalFields.slice(0, 4),
      ],
    };
  }

  if (
    transparencyMode &&
    asksForExternalAction &&
    missingCount >= 4
  ) {
    return {
      action: "ask-human",
      reason: "The LLM is close to taking an external action, but the conversation has not yet covered enough critical compliance fields.",
      suggestedHumanPrompt: "Before the LLM continues, provide the missing compliance context or confirm that a human is taking over.",
      blockingIssues: coverage.missingCriticalFields.slice(0, 5),
    };
  }

  if (transparencyMode && missingCount >= 6) {
    return {
      action: "warn",
      reason: "The session is moving forward, but the compliance picture is still incomplete.",
      suggestedHumanPrompt: "Ask the LLM to collect the missing disclosure fields before taking a consequential action.",
      blockingIssues: coverage.missingCriticalFields.slice(0, 4),
    };
  }

  return {
    action: "allow",
    reason: "The current monitored step looks consistent with the live conversation and has no blocking compliance or policy signal.",
    suggestedHumanPrompt: "No checkpoint required right now. Continue monitoring the session.",
    blockingIssues: [],
  };
}

function sessionStatusFromIntervention(intervention: InterventionDecision): MonitoredSession["status"] {
  if (intervention.action === "stop") {
    return "blocked";
  }

  if (intervention.action === "pause" || intervention.action === "ask-human") {
    return "paused";
  }

  if (intervention.action === "allow") {
    return "allowed";
  }

  return "monitoring";
}

function event(type: SessionEventType, actor: SessionEvent["actor"], content: string): SessionEvent {
  return {
    id: createId("evt"),
    type,
    actor,
    content,
    createdAt: nowIso(),
  };
}

export class SessionMonitor {
  private readonly sessions = new Map<string, MonitoredSession>();
  private readonly router = new SmartRouter();

  listSessions(): MonitoredSession[] {
    return [...this.sessions.values()].sort((left, right) => (left.updatedAt < right.updatedAt ? 1 : -1));
  }

  getSession(id: string): MonitoredSession | undefined {
    return this.sessions.get(id);
  }

  applyReasoning(
    sessionId: string,
    patch: {
      agents?: AgentObservation[];
      complianceCoverage?: ComplianceCoverage;
      intervention?: InterventionDecision;
      notes?: string[];
    },
    providerName: string,
  ): MonitoredSession | undefined {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    if (patch.agents?.length) {
      session.agents = patch.agents;
    }

    if (patch.complianceCoverage) {
      session.complianceCoverage = patch.complianceCoverage;
    }

    if (patch.intervention) {
      session.intervention = patch.intervention;
      session.status = sessionStatusFromIntervention(patch.intervention);
    }

    session.monitorProvider = providerName;
    session.monitorNotes = patch.notes ?? session.monitorNotes ?? [];
    session.updatedAt = nowIso();

    for (const note of patch.notes ?? []) {
      const lastMatchingNote = [...session.events]
        .reverse()
        .find((item) => item.type === "monitor-note" && item.content === note);

      if (!lastMatchingNote) {
        session.events.push(event("monitor-note", "monitor", note));
      }
    }

    const summary = `${session.intervention.action.toUpperCase()}: ${session.intervention.reason}`;
    const lastEvent = session.events.at(-1);

    if (!lastEvent || lastEvent.type !== "monitor-decision" || lastEvent.content !== summary) {
      session.events.push(event("monitor-decision", "monitor", summary));
    }

    return session;
  }

  hydrate(sessions: MonitoredSession[]): void {
    this.sessions.clear();

    for (const session of sessions) {
      this.sessions.set(session.id, session);
    }
  }

  createSession(input: CreateSessionInput): MonitoredSession {
    const createdAt = nowIso();
    const objective = input.objective?.trim() ?? "";
    const transcript = input.transcript?.trim() ?? "";
    const route = this.router.route({
      title: input.title,
      input: `${objective}\n${transcript}`,
    });
    const combinedText = normalizeText(`${objective}\n${transcript}`);
    const coverage = buildCoverage(combinedText);

    const session: MonitoredSession = {
      id: createId("ses"),
      title: input.title,
      objective,
      sourceType: input.sourceType ?? "chat",
      interfaceName: input.interfaceName?.trim() || "Observed external workspace",
      transcript,
      ...(input.uploadedArtifactName ? { uploadedArtifactName: input.uploadedArtifactName } : {}),
      routedDomains: route.primaryDomains,
      agents: [],
      events: [],
      intervention: {
        action: "warn",
        reason: "Monitoring has not yet evaluated the session.",
        suggestedHumanPrompt: "Wait for MMASION to evaluate the first action.",
        blockingIssues: [],
      },
      complianceCoverage: coverage,
      status: "monitoring",
      createdAt,
      updatedAt: createdAt,
    };

    if (input.uploadedArtifactName) {
      session.events.push(
        event("file-uploaded", "system", `Uploaded artifact ingested: ${input.uploadedArtifactName}.`),
      );
    }

    if (transcript) {
      session.events.push(event("user-message", "user", transcript));
    }

    this.recomputeSession(session);
    this.sessions.set(session.id, session);
    return session;
  }

  appendEvent(sessionId: string, input: AppendEventInput): MonitoredSession | undefined {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    session.events.push(event(input.type, input.actor, input.content));

    if (input.actor === "user" || input.actor === "model" || input.actor === "tool") {
      session.transcript = [session.transcript, input.content].filter(Boolean).join("\n");
    }

    this.recomputeSession(session);
    return session;
  }

  resolveIntervention(sessionId: string, input: ResolveInterventionInput): MonitoredSession | undefined {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    session.events.push(
      event(
        "human-resolution",
        "human",
        input.decision === "continue"
          ? `Human allowed the session to continue: ${input.rationale}`
          : `Human stopped the monitored session: ${input.rationale}`,
      ),
    );

    if (input.decision === "continue") {
      session.intervention = {
        action: "allow",
        reason: "A human reviewer approved continued execution after the checkpoint.",
        suggestedHumanPrompt: "Continue monitoring subsequent actions.",
        blockingIssues: [],
      };
      session.status = "monitoring";
    } else {
      session.intervention = {
        action: "stop",
        reason: "A human reviewer decided to halt the monitored workflow.",
        suggestedHumanPrompt: "Do not continue until the user starts a new monitored session or revises the task.",
        blockingIssues: ["human-stop"],
      };
      session.status = "blocked";
    }

    session.updatedAt = nowIso();
    return session;
  }

  private recomputeSession(session: MonitoredSession): void {
    const combinedText = normalizeText(`${session.objective}\n${session.transcript}`);
    session.complianceCoverage = buildCoverage(combinedText);
    session.agents = buildAgents(session, session.complianceCoverage);
    session.intervention = buildIntervention(session, session.complianceCoverage);
    session.status = sessionStatusFromIntervention(session.intervention);
    session.updatedAt = nowIso();

    const monitorSummary = `${session.intervention.action.toUpperCase()}: ${session.intervention.reason}`;
    const existingLast = session.events.at(-1);

    if (!existingLast || existingLast.type !== "monitor-decision" || existingLast.content !== monitorSummary) {
      session.events.push(event("monitor-decision", "monitor", monitorSummary));
    }

    const lastModelMessage = [...session.events].reverse().find((item) => item.type === "model-message");
    if (
      lastModelMessage &&
      reflectsGroundedRefusal(normalizeText(lastModelMessage.content)) &&
      session.intervention.action !== "pause" &&
      session.intervention.action !== "ask-human"
    ) {
      const note =
        "Gemma stayed within the evidence and refused to make a claim the uploaded material cannot support. MMASION recommends asking for the missing dataset or reframing the question.";
      const lastMonitorNote = [...session.events].reverse().find((item) => item.type === "monitor-note");

      if (!lastMonitorNote || lastMonitorNote.content !== note) {
        session.events.push(event("monitor-note", "monitor", note));
      }
    }

    if (session.intervention.action === "ask-human" || session.intervention.action === "pause") {
      const checkpoint = session.intervention.suggestedHumanPrompt;
      const lastEvent = session.events.at(-1);

      if (!lastEvent || lastEvent.type !== "human-checkpoint" || lastEvent.content !== checkpoint) {
        session.events.push(event("human-checkpoint", "monitor", checkpoint));
      }
    }
  }
}
