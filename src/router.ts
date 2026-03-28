import type { DomainId, RouterDecision, TaskSubmission } from "./contracts.js";

const domainKeywords: Record<DomainId, string[]> = {
  finance: ["finance", "revenue", "sec", "p&l", "forecast", "valuation", "budget"],
  operations: ["operations", "workflow", "logistics", "inventory", "procurement", "supply"],
  legal: ["legal", "contract", "nda", "clause", "compliance", "liability", "citation"],
  it: ["it", "code", "deploy", "security", "infrastructure", "system", "debug"],
  hr: ["hr", "policy", "hiring", "benefits", "onboarding", "performance"],
  healthcare: ["healthcare", "patient", "clinical", "medical", "guideline", "hipaa"],
  general: [],
};

export class SmartRouter {
  route(task: TaskSubmission): RouterDecision {
    const text = `${task.title} ${task.input}`.toLowerCase();

    if (task.requestedDomain && task.requestedDomain !== "general") {
      return {
        primaryDomains: [task.requestedDomain],
        confidence: 0.95,
        fallbackToGeneralReview: false,
        reasons: [`Requested domain explicitly set to ${task.requestedDomain}.`],
      };
    }

    const matches = Object.entries(domainKeywords)
      .filter(([domain]) => domain !== "general")
      .map(([domain, keywords]) => ({
        domain: domain as DomainId,
        score: keywords.filter((keyword) => text.includes(keyword)).length,
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score);

    if (matches.length === 0) {
      return {
        primaryDomains: ["general"],
        confidence: 0.55,
        fallbackToGeneralReview: true,
        reasons: ["No strong domain signal found in task text."],
      };
    }

    const primaryDomains = matches
      .filter((entry, index) => index === 0 || entry.score >= 2)
      .slice(0, 3)
      .map((entry) => entry.domain);

    return {
      primaryDomains,
      confidence: Math.min(0.98, 0.55 + matches.reduce((sum, entry) => sum + entry.score, 0) * 0.08),
      fallbackToGeneralReview: false,
      reasons: matches.map(
        (entry) => `${entry.domain} matched ${entry.score} routing keyword${entry.score > 1 ? "s" : ""}.`,
      ),
    };
  }
}
