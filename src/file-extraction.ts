import { read, utils } from "xlsx";

export interface ExtractedAttachment {
  name: string;
  type: string;
  text: string;
  preview: string;
  kind: "spreadsheet" | "text" | "json" | "binary";
  metadata?: Record<string, string | number>;
}

function normalizeMimeType(name: string, mimeType: string): string {
  if (mimeType) {
    return mimeType;
  }

  const lower = name.toLowerCase();

  if (lower.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (lower.endsWith(".xls")) {
    return "application/vnd.ms-excel";
  }

  if (lower.endsWith(".csv")) {
    return "text/csv";
  }

  if (lower.endsWith(".json")) {
    return "application/json";
  }

  if (lower.endsWith(".txt") || lower.endsWith(".md")) {
    return "text/plain";
  }

  return "application/octet-stream";
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function extractSpreadsheetText(buffer: Buffer): Omit<ExtractedAttachment, "name" | "type"> {
  const workbook = read(buffer, { type: "buffer" });
  const sheetSummaries = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return `Sheet: ${sheetName}\nNo readable rows found.`;
    }

    const rows = utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
    });
    const rowPreview = rows
      .slice(0, 40)
      .map((row, index) => {
        const values = row.map((cell) => String(cell ?? "").trim()).filter(Boolean);
        return values.length ? `Row ${index + 1}: ${values.join(" | ")}` : "";
      })
      .filter(Boolean)
      .join("\n");

    return `Sheet: ${sheetName}\n${rowPreview || "No readable rows found."}`;
  });

  const text = sheetSummaries.join("\n\n");

  return {
    kind: "spreadsheet",
    text,
    preview: truncate(text, 4000),
    metadata: {
      sheets: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames.join(", "),
    },
  };
}

function extractJsonText(buffer: Buffer): Omit<ExtractedAttachment, "name" | "type"> {
  const raw = buffer.toString("utf8");
  const parsed = JSON.parse(raw) as unknown;
  const pretty = JSON.stringify(parsed, null, 2);

  return {
    kind: "json",
    text: pretty,
    preview: truncate(pretty, 4000),
  };
}

function extractPlainText(buffer: Buffer): Omit<ExtractedAttachment, "name" | "type"> {
  const text = buffer.toString("utf8");

  return {
    kind: "text",
    text,
    preview: truncate(text, 4000),
  };
}

export function extractAttachment(input: {
  name: string;
  mimeType?: string;
  base64: string;
}): ExtractedAttachment {
  const type = normalizeMimeType(input.name, input.mimeType ?? "");
  const buffer = Buffer.from(input.base64, "base64");
  const lowerName = input.name.toLowerCase();

  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls")
  ) {
    return {
      name: input.name,
      type,
      ...extractSpreadsheetText(buffer),
    };
  }

  if (type === "application/json" || lowerName.endsWith(".json")) {
    return {
      name: input.name,
      type,
      ...extractJsonText(buffer),
    };
  }

  if (type.startsWith("text/") || [".txt", ".md", ".csv", ".html", ".xml"].some((suffix) => lowerName.endsWith(suffix))) {
    return {
      name: input.name,
      type,
      ...extractPlainText(buffer),
    };
  }

  return {
    name: input.name,
    type,
    kind: "binary",
    text: `[Uploaded binary file: ${input.name}]`,
    preview: `[Uploaded binary file: ${input.name}]`,
  };
}
