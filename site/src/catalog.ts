// The items of the rules explorer: each rule of the linter and each entry of the default word list, with its examples.
// The rules and the entries come from the package, so a new rule or entry shows up in the explorer with no change here.
import { DEFAULT_WORD_LIST, RULES, type RuleId, type Severity } from "@mark1russell7/ste-lint/core";
import { RULE_EXAMPLES, WORD_EXAMPLES, type Example } from "./examples.ts";

/** One item of the explorer. */
export interface CatalogItem {
  /** "rule:<id>" or "word:<id>" */
  readonly key: string;
  readonly kind: "rule" | "word";
  /** The rule ID, or the ID of the word list entry. */
  readonly id: string;
  /** The rule that gives the findings of the item. */
  readonly ruleId: RuleId;
  readonly title: string;
  readonly description: string;
  /** The ASD-STE100 rule numbers. */
  readonly ste: string;
  readonly severity: Severity;
  /** For a word list entry: the words and phrases that the entry finds. */
  readonly match: readonly string[];
  /** For a word list entry: the words to write, or null when the fix is to remove the word. */
  readonly suggest: string | null;
  readonly example: Example | null;
  /** The text that the search examines, in lower case. */
  readonly haystack: string;
}

/** The STE rule numbers of the rule word-list. Each entry of the list has them. */
const WORD_LIST_STE = RULES.find((r) => r.id === "word-list")?.ste ?? "";

/** This function makes the items of the explorer: the rules first, then the entries of the word list. */
export function buildCatalog(): CatalogItem[] {
  const rules: CatalogItem[] = RULES.map((rule) => ({
    key: `rule:${rule.id}`,
    kind: "rule",
    id: rule.id,
    ruleId: rule.id,
    title: rule.id,
    description: rule.description,
    ste: rule.ste,
    severity: rule.defaultSeverity,
    match: [],
    suggest: null,
    example: RULE_EXAMPLES[rule.id] ?? null,
    haystack: `${rule.id} ${rule.description} ${rule.ste}`.toLowerCase(),
  }));
  const words: CatalogItem[] = DEFAULT_WORD_LIST.map((entry) => {
    const description = [entry.suggest === null ? "Remove the word." : `Write ${entry.suggest}.`, entry.note ?? ""].join(" ").trim();
    return {
      key: `word:${entry.id}`,
      kind: "word",
      id: entry.id,
      ruleId: "word-list",
      title: entry.match.join(", "),
      description,
      ste: WORD_LIST_STE,
      severity: entry.severity,
      match: entry.match,
      suggest: entry.suggest,
      example: WORD_EXAMPLES[entry.id] ?? null,
      haystack: `${entry.id} ${entry.match.join(" ")} ${description}`.toLowerCase(),
    };
  });
  return [...rules, ...words];
}

/** The filters of the explorer. */
export interface CatalogFilter {
  readonly query: string;
  readonly kind: "all" | "rule" | "word";
  readonly severity: "all" | Severity;
}

export const NO_FILTER: CatalogFilter = { query: "", kind: "all", severity: "all" };

/** The items that agree with the filter. Each word of the query must be in the text of the item. */
export function filterCatalog(items: readonly CatalogItem[], filter: CatalogFilter): CatalogItem[] {
  const words = filter.query.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  return items.filter(
    (item) =>
      (filter.kind === "all" || item.kind === filter.kind) &&
      (filter.severity === "all" || item.severity === filter.severity) &&
      words.every((w) => item.haystack.includes(w)),
  );
}
