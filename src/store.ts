import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { AuditRun, MonitoredSession } from "./contracts.js";

interface PersistedState {
  runs: AuditRun[];
}

interface PersistedSessionState {
  sessions: MonitoredSession[];
}

export class FileRunStore {
  constructor(private readonly path: string) {}

  load(): AuditRun[] {
    try {
      const raw = readFileSync(this.path, "utf8");
      const parsed = JSON.parse(raw) as PersistedState;
      return parsed.runs ?? [];
    } catch {
      return [];
    }
  }

  save(runs: AuditRun[]): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(
      this.path,
      JSON.stringify(
        {
          runs,
        } satisfies PersistedState,
        null,
        2,
      ),
      "utf8",
    );
  }
}

export class FileSessionStore {
  constructor(private readonly path: string) {}

  load(): MonitoredSession[] {
    try {
      const raw = readFileSync(this.path, "utf8");
      const parsed = JSON.parse(raw) as PersistedSessionState;
      return parsed.sessions ?? [];
    } catch {
      return [];
    }
  }

  save(sessions: MonitoredSession[]): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(
      this.path,
      JSON.stringify(
        {
          sessions,
        } satisfies PersistedSessionState,
        null,
        2,
      ),
      "utf8",
    );
  }
}
