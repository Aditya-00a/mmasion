import type { EscalationPacket, HumanResolution } from "./contracts.js";
import { createId, nowIso } from "./utils.js";

export class HumanReviewStore {
  private readonly packets = new Map<string, EscalationPacket>();
  private readonly learnedPreferences: string[] = [];

  open(runId: string, failures: string[], sourceConflicts: string[]): EscalationPacket {
    const packet: EscalationPacket = {
      id: createId("esc"),
      runId,
      question:
        "The verifier could not reach consensus after three attempts. Which interpretation or source should the system trust?",
      failures,
      sourceConflicts,
      suggestedActions: [
        "Approve the most conservative result",
        "Reject and request manual rewrite",
        "Override with explicit human guidance",
      ],
      open: true,
    };

    this.packets.set(packet.id, packet);
    return packet;
  }

  resolve(
    escalationId: string,
    input: Omit<HumanResolution, "resolvedAt">,
  ): EscalationPacket | undefined {
    const packet = this.packets.get(escalationId);

    if (!packet) {
      return undefined;
    }

    const resolution: HumanResolution = {
      ...input,
      resolvedAt: nowIso(),
    };

    packet.open = false;
    packet.resolution = resolution;

    if (resolution.rememberPreference) {
      this.learnedPreferences.push(`${packet.runId}: ${resolution.rationale}`);
    }

    return packet;
  }

  get(id: string): EscalationPacket | undefined {
    return this.packets.get(id);
  }

  getPreferences(): string[] {
    return [...this.learnedPreferences];
  }

  hydrate(packets: EscalationPacket[]): void {
    this.packets.clear();
    this.learnedPreferences.length = 0;

    for (const packet of packets) {
      this.packets.set(packet.id, packet);

      if (packet.resolution?.rememberPreference) {
        this.learnedPreferences.push(`${packet.runId}: ${packet.resolution.rationale}`);
      }
    }
  }
}
