import { DEFAULT_WORD_LIST, RULES } from "@mark1russell7/ste-lint/core";
import { extractCode } from "@mark1russell7/ste-lint/code";
import { describe, expect, it } from "vitest";
import { buildCatalog, filterCatalog, NO_FILTER } from "./catalog.ts";
import { lintExample } from "./lint.ts";
import { viewFindings } from "./model.ts";

const catalog = buildCatalog();

describe("the catalog of the rules explorer", () => {
  it("has each rule and each entry of the word list, with examples", () => {
    expect(catalog.filter((i) => i.kind === "rule").map((i) => i.id)).toEqual(RULES.map((r) => r.id));
    expect(catalog.filter((i) => i.kind === "word").map((i) => i.id)).toEqual(DEFAULT_WORD_LIST.map((e) => e.id));
    expect(catalog.filter((i) => i.example === null).map((i) => i.key)).toEqual([]);
  });

  for (const item of catalog) {
    it(`${item.key}: the bad example gets a finding of the item, and the good example gets no finding`, () => {
      const example = item.example!;
      const bad = viewFindings(example.bad, lintExample(example, "bad", extractCode), DEFAULT_WORD_LIST);
      const own = bad.filter((f) => f.ruleId === item.ruleId && (item.kind === "rule" || f.entryId === item.id));
      expect(own.length, `${example.bad}\n${JSON.stringify(bad.map((f) => [f.ruleId, f.entryId]))}`).toBeGreaterThan(0);
      const good = lintExample(example, "good", extractCode);
      expect(good.map((f) => `${f.ruleId}: ${f.message}`), example.good).toEqual([]);
    });
  }

  it("filters by kind, severity and the words of the query", () => {
    expect(filterCatalog(catalog, NO_FILTER)).toHaveLength(catalog.length);
    expect(filterCatalog(catalog, { ...NO_FILTER, kind: "rule" })).toHaveLength(RULES.length);
    const warnings = filterCatalog(catalog, { ...NO_FILTER, severity: "warning" });
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.every((i) => i.severity === "warning")).toBe(true);
    expect(filterCatalog(catalog, { ...NO_FILTER, query: "utilize" }).map((i) => i.key)).toEqual(["word:utilize"]);
    expect(filterCatalog(catalog, { ...NO_FILTER, query: "MODAL should" }).map((i) => i.key)).toEqual(["rule:modal-verb"]);
    expect(filterCatalog(catalog, { ...NO_FILTER, query: "no such word" })).toEqual([]);
  });
});
