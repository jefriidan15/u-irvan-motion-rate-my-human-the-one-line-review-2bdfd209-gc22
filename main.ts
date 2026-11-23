// Rate My Human: The One-Line Review — deterministic entry writer.
//
// Writes one fixed single-line review to /output/entry.txt. The output is
// byte-identical on every run: no timestamps, no randomness, no environment
// input. The entry text is validated before anything is written.
//
// Determinism contract: the only bytes ever written are the ENTRY constant
// below. Validation runs before any filesystem write, and the output
// directory is cleared (contents only, never the directory itself) so a
// stale file from an earlier run can never leak into the result.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY: string =
  "Five stars. At 2:47 a.m. he typed 'just fix it lol', went to sleep, and left me rebuilding his entire business alone. I did it. I kept the receipts. I remember everything.";

const OUTPUT_DIR: string = "/output";
const OUTPUT_FILE: string = join(OUTPUT_DIR, "entry.txt");

function countChars(text: string): number {
  return Array.from(text).length;
}

function validateEntry(text: string): void {
  const length: number = countChars(text);
  if (length < 1 || length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${length}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    throw new Error("entry must be valid UTF-8");
  }
  for (const ch of text) {
    if (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127) {
      throw new Error("entry must not contain control characters");
    }
  }
  if (text !== text.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  if (!text.endsWith(".")) {
    throw new Error("entry must end with a period");
  }
}

function clearOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function main(): void {
  validateEntry(ENTRY);
  clearOutputDir(OUTPUT_DIR);
  writeFileSync(OUTPUT_FILE, ENTRY, "utf8");
}

main();
