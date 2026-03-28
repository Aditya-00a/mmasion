export type DomainId =
  | "finance"
  | "operations"
  | "legal"
  | "it"
  | "hr"
  | "healthcare"
  | "general";

export type VerificationCheckKind =
  | "grounding"
  | "cross-reference"
  | "semantic-policy";

export type RunStatus = "committed" | "rolled_back" | "escalated" | "pending";

export type ConsensusOutcome = "commit" | "rollback" | "retry" | "escalate";

export type SessionStatus = "monitoring" | "paused" | "allowed" | "blocked" | "completed";

export type SessionSourceType = "chat" | "upload" | "voice";

export type SessionEventType =
  | "user-message"
  | "model-message"
  | "tool-action"
  | "file-uploaded"
  | "monitor-note"
  | "monitor-decision"
  | "human-checkpoint"
  | "human-resolution";

export type InterventionAction = "allow" | "warn" | "pause" | "stop" | "ask-human";

export interface TaskSubmission {
  title: string;
  input: string;
  requestedDomain?: DomainId;
  attachments?: string[];
  tenantId?: string;
}

export interface RouterDecision {
  primaryDomains: DomainId[];
  confidence: number;
  fallbackToGeneralReview: boolean;
  reasons: string[];
}

export interface DomainAgentRequest {
  runId: string;
  task: TaskSubmission;
  attempt: number;
  domain: DomainId;
  feedback: string[];
}

export interface DomainAgentResponse {
  domain: DomainId;
  summary: string;
  keyClaims: string[];
  evidence: string[];
  openRisks: string[];
  recommendedAction: string;
  requiresHumanReview: boolean;
  claims: string[];
  citations: string[];
  toolTrace: string[];
  riskFlags: string[];
  confidence: number;
}

export interface DecisionSummary {
  releaseDecision: "approved" | "blocked" | "escalated" | "retrying";
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  nextAction: string;
  reasons: string[];
  controlScores: Record<VerificationCheckKind, number>;
  domainsInScope: DomainId[];
  needsHumanReview: boolean;
}

export interface ComplianceFieldDefinition {
  fieldName: string;
  description: string;
  expectedValues?: string;
  limitations?: string;
  notes?: string;
  triggerKeywords: string[];
  critical?: boolean;
}

export interface SessionEvent {
  id: string;
  type: SessionEventType;
  actor: "user" | "model" | "tool" | "monitor" | "human" | "system";
  content: string;
  createdAt: string;
}

export interface AgentObservation {
  id: string;
  name: string;
  role: string;
  selectedBecause: string;
  summary: string;
  confidence: number;
  flags: string[];
}

export interface InterventionDecision {
  action: InterventionAction;
  reason: string;
  suggestedHumanPrompt: string;
  blockingIssues: string[];
}

export interface ComplianceCoverage {
  matchedFields: string[];
  missingCriticalFields: string[];
  riskSignals: string[];
}

export interface InterleavedOutputBlock {
  type: "narrative" | "fact" | "warning" | "question";
  title: string;
  content: string;
}

export interface TransparencyBrief {
  title: string;
  plainLanguageSummary: string;
  residentImpact: string[];
  agenciesMentioned: string[];
  decisionAreas: string[];
  complianceGaps: string[];
  suggestedQuestions: string[];
  interleavedOutput: InterleavedOutputBlock[];
  provider: string;
}

export interface MonitoredSession {
  id: string;
  title: string;
  objective: string;
  sourceType: SessionSourceType;
  interfaceName: string;
  transcript: string;
  uploadedArtifactName?: string;
  routedDomains: DomainId[];
  agents: AgentObservation[];
  events: SessionEvent[];
  intervention: InterventionDecision;
  complianceCoverage: ComplianceCoverage;
  monitorProvider?: string;
  monitorNotes?: string[];
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationCheckResult {
  kind: VerificationCheckKind;
  passed: boolean;
  score: number;
  notes: string[];
  blocking: boolean;
}

export interface ConsensusDecision {
  outcome: ConsensusOutcome;
  agreement: number;
  rationale: string[];
}

export interface AuditAttempt {
  attemptNumber: number;
  responses: DomainAgentResponse[];
  verification: VerificationCheckResult[];
  feedback: string[];
  consensus: ConsensusDecision;
}

export interface HumanResolution {
  reviewer: string;
  decision: "approve" | "reject" | "override";
  rationale: string;
  rememberPreference: boolean;
  resolvedAt: string;
}

export interface EscalationPacket {
  id: string;
  runId: string;
  question: string;
  failures: string[];
  sourceConflicts: string[];
  suggestedActions: string[];
  open: boolean;
  resolution?: HumanResolution;
}

export interface AuditRun {
  id: string;
  task: TaskSubmission;
  routerDecision: RouterDecision;
  attempts: AuditAttempt[];
  status: RunStatus;
  finalSummary?: string;
  decisionSummary?: DecisionSummary;
  escalation?: EscalationPacket;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderAdapter {
  name: string;
  generateDomainResponse(request: DomainAgentRequest): Promise<DomainAgentResponse>;
  ground(response: DomainAgentResponse, task: TaskSubmission): Promise<VerificationCheckResult>;
  crossReference(
    responses: DomainAgentResponse[],
    task: TaskSubmission,
    attempt: number,
  ): Promise<VerificationCheckResult>;
  semanticPolicy(
    responses: DomainAgentResponse[],
    task: TaskSubmission,
    attempt: number,
  ): Promise<VerificationCheckResult>;
}

export interface RuntimeStatus {
  provider: string;
  mode: "simulation" | "local-model";
  detail: string;
}

export interface VerificationPolicy {
  groundingThresholds: Record<1 | 2 | 3, number>;
  crossReferenceThresholds: Record<1 | 2 | 3, number>;
  semanticThresholds: Record<1 | 2 | 3, number>;
  commitAgreementThreshold: number;
  rollbackOnBlockingFailure: boolean;
}
