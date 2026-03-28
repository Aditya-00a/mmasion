import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseLine(line: string): [string, string] | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separator = trimmed.indexOf("=");

  if (separator <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separator).trim();
  let value = trimmed.slice(separator + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

export function loadEnvFile(path = ".env"): void {
  const fullPath = resolve(path);

  if (!existsSync(fullPath)) {
    return;
  }

  const raw = readFileSync(fullPath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const parsed = parseLine(line);

    if (!parsed) {
      continue;
    }

    const [key, value] = parsed;

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
