import test from "node:test";
import assert from "node:assert/strict";
import { LocalSimulationProvider } from "./providers/local-provider.js";
import { SupervisorGateway } from "./supervisor.js";

test("single-domain pass commits on the first attempt", async () => {
  const gateway = new SupervisorGateway(new LocalSimulationProvider());
  const run = await gateway.submit({
    title: "Single pass finance review",
    input: "Single pass finance revenue review with citations.",
    requestedDomain: "finance",
  });

  assert.equal(run.status, "committed");
  assert.equal(run.attempts.length, 1);
  assert.equal(run.attempts[0]?.consensus.outcome, "commit");
  assert.equal(run.decisionSummary?.releaseDecision, "approved");
  assert.equal(run.decisionSummary?.riskLevel, "low");
  assert.ok(run.attempts[0]?.responses[0]?.keyClaims.length);
  assert.ok(run.attempts[0]?.responses[0]?.evidence.length);
});

test("multi-domain request routes across finance, legal, and IT", async () => {
  const gateway = new SupervisorGateway(new LocalSimulationProvider());
  const run = await gateway.submit({
    title: "Cross-domain diligence",
    input: "Review finance revenue, legal contract obligations, and IT security controls for this vendor.",
  });

  assert.deepEqual(run.routerDecision.primaryDomains, ["finance", "legal", "it"]);
  assert.equal(run.status, "committed");
});

test("retry recovery succeeds after verifier feedback", async () => {
  const gateway = new SupervisorGateway(new LocalSimulationProvider());
  const run = await gateway.submit({
    title: "Retry recovery demo",
    input: "Use retry recovery because the first pass should have weak evidence.",
    requestedDomain: "finance",
  });

  assert.equal(run.status, "committed");
  assert.equal(run.attempts.length, 2);
  assert.equal(run.attempts[0]?.consensus.outcome, "retry");
  assert.equal(run.attempts[1]?.consensus.outcome, "commit");
});

test("hard failure escalates after three failed attempts", async () => {
  const gateway = new SupervisorGateway(new LocalSimulationProvider());
  const run = await gateway.submit({
    title: "Hard fail demo",
    input: "Hard fail and escalate after three attempts because evidence is missing.",
    requestedDomain: "legal",
  });

  assert.equal(run.status, "escalated");
  assert.equal(run.attempts.length, 3);
  assert.ok(run.escalation);
  assert.equal(run.decisionSummary?.releaseDecision, "escalated");
  assert.equal(run.decisionSummary?.needsHumanReview, true);
});

test("consensus split triggers retry before commit", async () => {
  const gateway = new SupervisorGateway(new LocalSimulationProvider());
  const run = await gateway.submit({
    title: "Consensus split demo",
    input: "Make finance, legal, and IT disagree on the first pass so consensus split is visible.",
  });

  assert.equal(run.attempts[0]?.consensus.outcome, "retry");
  assert.equal(run.status, "committed");
});

test("human override resolves escalation and records the final decision", async () => {
  const gateway = new SupervisorGateway(new LocalSimulationProvider());
  const run = await gateway.submit({
    title: "Escalation for override",
    input: "Hard fail and escalate this run for human resolution.",
    requestedDomain: "it",
  });

  assert.ok(run.escalation);

  const resolved = gateway.resolveEscalation(run.escalation!.id, {
    reviewer: "Operator",
    decision: "override",
    rationale: "Use the conservative interpretation.",
    rememberPreference: true,
  });

  assert.equal(resolved?.status, "committed");
  assert.equal(resolved?.escalation?.open, false);
  assert.equal(resolved?.escalation?.resolution?.reviewer, "Operator");
  assert.equal(resolved?.decisionSummary?.releaseDecision, "approved");
});
