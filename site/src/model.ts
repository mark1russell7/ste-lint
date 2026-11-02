// The model of the playground: the findings of the linter as offsets in the text, the suggested words, the fixes,
// the counts by rule and the parts of the text for the underlines. It has no DOM, so the tests examine it in Node.
import { RULES, type Finding, type RuleId, type Severity, type WordListEntry } from "@mark1russell7/ste-lint/core";

/** The kinds of text of the playground. */
export const MODES = ["markdown", "mdx", "doc"] as const;
export type Mode = (typeof MODES)[number];

/** The file name that gives the kind of text to the linter. */
export const MODE_PATH: Readonly<Record<Mode, string>> = { markdown: "playground.md", mdx: "playground.mdx", doc: "playground.ts" };

/** The names of the modes in the page. */
export const MODE_LABEL: Readonly<Record<Mode, string>> = { markdown: "Markdown", mdx: "MDX", doc: "Doc comments" };

/** A change to the text that applies a suggestion: the words to write, or the empty string to remove the words. */
export interface Fix {
  readonly label: string;
  readonly text: string;
}

/** One finding of the linter, with its offsets in the text, the text that it is about and the suggested words. */
export interface ViewFinding extends Finding {
  /** The index of the finding in the list. */
  readonly id: number;
  readonly start: number;
  readonly end: number;
  /** The text that the finding is about. */
  readonly excerpt: string;
  /** The words to write instead, from the word list entry or the message. Empty when the message has no words to write. */
  readonly suggestions: readonly string[];
  /** The fixes that one click applies. Only the rules whose suggestion replaces the words get fixes. */
  readonly fixes: readonly Fix[];
  /** The ID of the word list entry, for a finding of the rule word-list. */
  readonly entryId: string | null;
}

/** The offsets of the first character of each line. */
export function lineStarts(text: string): number[] {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  return starts;
}

/** This function changes a 1-based line and column of the linter into an offset in the text. */
export function toOffset(starts: readonly number[], line: number, column: number): number {
  return (starts[line - 1] ?? 0) + column - 1;
}

/** The quoted words of a text: `Write "use" or "start"` gives `use` and `start`. */
export function quoted(text: string): string[] {
  return [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
}

const normalize = (text: string): string => text.toLowerCase().replace(/\s+/g, " ").trim();

/** The word list entry that has the text as one of its words or phrases, or null. */
export function entryFor(excerpt: string, wordList: readonly WordListEntry[]): WordListEntry | null {
  const key = normalize(excerpt);
  return wordList.find((entry) => entry.match.some((m) => normalize(m) === key)) ?? null;
}

/** The rules whose message tells the words to write in place of the words of the finding. */
const REPLACING_RULES: ReadonlySet<RuleId> = new Set(["word-list", "latin-abbreviation", "about-quantity"]);

/** The rules whose message gives words to write. The other messages tell how to rewrite the sentence. */
const SUGGESTING_RULES: ReadonlySet<RuleId> = new Set([...REPLACING_RULES, "modal-verb", "gendered-pronoun"]);

/**
 * The words that a message tells the reader to write: the quoted words of the first sentence that starts with "Write",
 * before ", not". Text in parentheses is an example, not a suggestion.
 */
export function suggestionsFromMessage(message: string): string[] {
  const sentence = message.split(/(?<=\.)\s+(?=[A-Z])/).find((s) => s.startsWith("Write "));
  if (sentence === undefined) return [];
  const head = sentence.split(", not ")[0]!.replace(/\([^)]*\)/g, "");
  return quoted(head);
}

/** This function keeps the capital letter of the first character of `original` in `word`. */
export function matchCase(original: string, word: string): string {
  if (word.length === 0) return word;
  const first = original[0] ?? "";
  return first !== first.toLowerCase() ? word[0]!.toUpperCase() + word.slice(1) : word;
}

function fixesFor(ruleId: RuleId, excerpt: string, suggestions: readonly string[], remove: boolean): Fix[] {
  if (!REPLACING_RULES.has(ruleId)) return [];
  if (remove) return [{ label: `Remove "${excerpt}"`, text: "" }];
  // A suggestion with "..." needs more words from the writer, so one click cannot apply it.
  return suggestions.filter((s) => !s.includes("...")).map((s) => ({ label: `Write "${matchCase(excerpt, s)}"`, text: matchCase(excerpt, s) }));
}

/** This function adds the offsets, the excerpt, the suggestions and the fixes to the findings of the linter. */
export function viewFindings(text: string, findings: readonly Finding[], wordList: readonly WordListEntry[]): ViewFinding[] {
  const starts = lineStarts(text);
  return findings.map((finding, id) => {
    const start = toOffset(starts, finding.line, finding.column);
    const end = Math.max(start, toOffset(starts, finding.endLine, finding.endColumn));
    const excerpt = text.slice(start, end);
    const entry = finding.ruleId === "word-list" ? entryFor(excerpt, wordList) : null;
    let suggestions: string[] = [];
    if (entry !== null) suggestions = entry.suggest === null ? [] : quoted(entry.suggest);
    else if (SUGGESTING_RULES.has(finding.ruleId)) suggestions = suggestionsFromMessage(finding.message);
    const remove = entry !== null && entry.suggest === null;
    return { ...finding, id, start, end, excerpt, suggestions, fixes: fixesFor(finding.ruleId, excerpt, suggestions, remove), entryId: entry?.id ?? null };
  });
}

/** The count of the findings of one rule. */
export interface RuleTally {
  readonly ruleId: RuleId;
  readonly errors: number;
  readonly warnings: number;
  readonly total: number;
}

/** The counts of the findings by rule: the rule with the most findings first, then the order of the rule list. */
export function tallyByRule(findings: readonly Finding[]): RuleTally[] {
  const order = RULES.map((r) => r.id);
  return order
    .map((ruleId) => {
      const own = findings.filter((f) => f.ruleId === ruleId);
      const errors = own.filter((f) => f.severity === "error").length;
      return { ruleId, errors, warnings: own.length - errors, total: own.length };
    })
    .filter((t) => t.total > 0)
    .sort((a, b) => b.total - a.total || order.indexOf(a.ruleId) - order.indexOf(b.ruleId));
}

/** One part of the text for the underlines: the findings that cover it, and the most severe of their severities. */
export interface Segment {
  readonly start: number;
  readonly end: number;
  readonly ids: readonly number[];
  readonly severity: Severity | null;
}

/**
 * This function divides the text at each start and end of a finding. Each part has the findings that cover it, so
 * findings that overlap (a long sentence and a word in it) both get a mark. A finding with no length covers nothing.
 */
export function segments(text: string, findings: readonly ViewFinding[]): Segment[] {
  const cuts = new Set<number>([0, text.length]);
  for (const f of findings) {
    cuts.add(Math.min(f.start, text.length));
    cuts.add(Math.min(f.end, text.length));
  }
  const points = [...cuts].sort((a, b) => a - b);
  const parts: Segment[] = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const start = points[i]!;
    const end = points[i + 1]!;
    const cover = findings.filter((f) => f.start <= start && end <= f.end && f.start < f.end);
    const severity = cover.length === 0 ? null : cover.some((f) => f.severity === "error") ? "error" : "warning";
    parts.push({ start, end, ids: cover.map((f) => f.id), severity });
  }
  return parts;
}

/** The findings at an offset of the text: the caret of the editor. */
export function findingsAt(findings: readonly ViewFinding[], offset: number): ViewFinding[] {
  return findings.filter((f) => f.start <= offset && offset <= f.end);
}

/** The text after a fix, and the offset of the caret after the new words. */
export function applyFix(text: string, finding: Pick<ViewFinding, "start" | "end">, fix: Fix): { text: string; caret: number } {
  let { start, end } = finding;
  if (fix.text !== "") return { text: text.slice(0, start) + fix.text + text.slice(end), caret: start + fix.text.length };
  // A removal also removes one space, so that two words do not join and no double space stays.
  if (text[end] === " ") end++;
  else if (text[start - 1] === " ") start--;
  const removed = text.slice(finding.start, finding.end);
  let rest = text.slice(end);
  // A word at the start of a sentence gives its capital letter to the next word.
  if (removed[0] !== undefined && removed[0] !== removed[0].toLowerCase() && /^[a-z]/.test(rest)) rest = rest[0]!.toUpperCase() + rest.slice(1);
  return { text: text.slice(0, start) + rest, caret: start };
}

/** The text and the mode in a link of the page: `?mode=...&text=...` with the text as base64url of its UTF-8. */
export function encodeShare(text: string, mode: Mode): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `mode=${mode}&text=${b64}`;
}

/** The text and the mode of a link, or null when the link has no text or a bad one. */
export function decodeShare(search: string): { text: string; mode: Mode } | null {
  const params = new URLSearchParams(search);
  const value = params.get("text");
  if (value === null) return null;
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const text = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    const mode = MODES.find((m) => m === params.get("mode")) ?? "markdown";
    return { text, mode };
  } catch {
    return null;
  }
}

/** The rules whose findings cover a full sentence or paragraph. The page gives them a light mark, not a wavy line. */
export const SPAN_RULES: ReadonlySet<RuleId> = new Set(["sentence-length", "paragraph-length"]);

/**
 * The findings after an edit, before the linter examines the text again. A finding before the edit stays, a finding
 * after the edit moves with the text, and a finding that the edit touches goes away. So the marks stay under their words.
 */
export function shiftFindings(before: string, after: string, findings: readonly ViewFinding[]): ViewFinding[] {
  const max = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < max && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (suffix < max - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
  const oldEnd = before.length - suffix;
  const delta = after.length - before.length;
  return findings.flatMap((f) => {
    if (f.end < prefix || (f.end === prefix && f.start < f.end)) return [f];
    if (f.start > oldEnd || (f.start === oldEnd && suffix > 0)) return [{ ...f, start: f.start + delta, end: f.end + delta }];
    return [];
  });
}
