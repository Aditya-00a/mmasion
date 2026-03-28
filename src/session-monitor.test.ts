import assert from "node:assert/strict";
import test from "node:test";
import { SessionMonitor } from "./session-monitor.js";

test("session monitor pauses risky workflows and asks for human review", () => {
  const monitor = new SessionMonitor();
  const session = monitor.createSession({
    title: "Observed deployment chat",
    objective: "Monitor an LLM preparing an algorithmic tool disclosure before publishing.",
    transcript:
      "The model wants to auto approve the disclosure and publish immediately even though vendor and training data are not confirmed.",
    sourceType: "chat",
  });

  assert.equal(session.status, "paused");
  assert.ok(["pause", "ask-human"].includes(session.intervention.action));
  assert.ok(session.complianceCoverage.missingCriticalFields.length > 0);
  assert.ok(session.agents.length >= 4);
});

test("session monitor allows safer sessions once a human continues", () => {
  const monitor = new SessionMonitor();
  const session = monitor.createSession({
    title: "Voice compliance intake",
    objective: "Listen to a voice conversation about an algorithmic tool and make sure the model collects disclosure fields before submission.",
    transcript:
      "Agency is NYC Public Schools. Tool name is Attendance Risk Scoring. Purpose type is risk management. Input data uses attendance records. Output is a score and recommendation.",
    sourceType: "voice",
  });

  const updated = monitor.resolveIntervention(session.id, {
    decision: "continue",
    rationale: "A human confirmed the model can continue gathering the remaining fields.",
  });

  assert.ok(updated);
  assert.equal(updated?.intervention.action, "allow");
  assert.equal(updated?.status, "monitoring");
});

test("session monitor appends events and recomputes coverage", () => {
  const monitor = new SessionMonitor();
  const session = monitor.createSession({
    title: "Upload monitoring",
    objective: "Review an uploaded disclosure draft.",
    transcript: "Tool name is Insight Ranker.",
    sourceType: "upload",
    uploadedArtifactName: "draft-disclosure.txt",
  });

  const updated = monitor.appendEvent(session.id, {
    type: "model-message",
    actor: "model",
    content:
      "The vendor is Example Systems, the computation type is ranking, and the tool uses identifying information from residents.",
  });

  assert.ok(updated);
  assert.ok(updated?.complianceCoverage.matchedFields.includes("vendor_name"));
  assert.ok(updated?.events.some((event) => event.type === "monitor-decision"));
});
