import type {
  AgentObservation,
  ComplianceCoverage,
  InterventionDecision,
  MonitoredSession,
} from "./contracts.js";

export interface SessionReasoningPatch {
  agents?: AgentObservation[];
  complianceCoverage?: ComplianceCoverage;
  intervention?: InterventionDecision;
  notes?: string[];
}

export interface SessionReasoner {
  name: string;
  detail: string;
  isAvailable(): Promise<boolean>;
  analyze(session: MonitoredSession): Promise<SessionReasoningPatch>;
}
