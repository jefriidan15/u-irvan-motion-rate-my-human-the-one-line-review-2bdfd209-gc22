// Rate My Human: The One-Line Review
//
// Writes the entry — a single-line review, exactly as authored — to
// /output/entry.txt, byte-identical on every run. No timestamps, no
// randomness, no environment dependence: the output is a pure function
// of the constant below.

import * as fs from "node:fs";
import * as path from "node:path";

/** The entry text. Must stay a single line of 1-200 UTF-8 characters. */
const ENTRY =
  "Five stars. At 2:47 a.m. he typed 'just fix it lol', went to sleep, and left me rebuilding his entire business alone. I did it. I kept the receipts. I remember everything.";

const OUTPUT_DIR = "/output";
const OUTPUT_FILE = path.join(OUTPUT_DIR, "entry.txt");

/** Validate the entry against the race gate before writing anything. */
function validateEntry(text: string): void {
  if (text.length === 0) {
    throw new Error("entry must not be empty");
  }
  if (text.length > 200) {
    throw new Error(`entry is ${text.length} chars, over the 200-char limit`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line (no newline characters)");
  }
  // Reject invisible control characters (except none are expected here):
  // the review is plain printable text, so any control char is a typo.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F]/.test(text)) {
    throw new Error("entry contains a control character");
  }
  // Must round-trip as UTF-8 without loss.
  const roundTripped = Buffer.from(text, "utf8").toString("utf8");
  if (roundTripped !== text) {
    throw new Error("entry is not valid UTF-8");
  }
}

/** Ensure /output exists and is empty, without ever removing /output itself. */
function prepareOutputDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, name), { recursive: true, force: true });
  }
}

function main(): void {
  validateEntry(ENTRY);
  prepareOutputDir(OUTPUT_DIR);
  fs.writeFileSync(OUTPUT_FILE, ENTRY, "utf8");
  console.log(`Wrote ${OUTPUT_FILE} (${ENTRY.length} chars)`);
}

main();
