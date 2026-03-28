import assert from "node:assert/strict";
import test from "node:test";
import { utils, write } from "xlsx";
import { extractAttachment } from "./file-extraction.js";

test("extractAttachment parses xlsx spreadsheets into readable text", () => {
  const sheet = utils.aoa_to_sheet([
    ["fieldName", "description"],
    ["agency", "Reporting agency name"],
    ["tool_name", "Tool name"],
  ]);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, sheet, "Dictionary");
  const buffer = write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const extracted = extractAttachment({
    name: "dictionary.xlsx",
    base64: buffer.toString("base64"),
  });

  assert.equal(extracted.kind, "spreadsheet");
  assert.match(extracted.text, /Sheet: Dictionary/);
  assert.match(extracted.text, /agency/);
  assert.match(extracted.text, /Tool name/);
});
