import { Linter, resolveConfig } from "@mark1russell7/ste-lint";
import { extractCode } from "@mark1russell7/ste-lint/code";
import { DEFAULT_WORD_LIST } from "@mark1russell7/ste-lint/core";
import { describe, expect, it } from "vitest";
import { configFile, DEFAULT_SETTINGS, makeLinter } from "./lint.ts";
import {
  applyFix,
  decodeShare,
  encodeShare,
  entryFor,
  findingsAt,
  lineStarts,
  matchCase,
  MODE_PATH,
  segments,
  shiftFindings,
  suggestionsFromMessage,
  tallyByRule,
  toOffset,
  typographic,
  viewFindings,
} from "./model.ts";
import { SAMPLES } from "./samples.ts";

const cli = new Linter(resolveConfig({}, { root: "/" }));

describe("the linter of the page", () => {
  for (const sample of SAMPLES) {
    it(`gives the same findings as the command line for the sample "${sample.label}"`, () => {
      const path = MODE_PATH[sample.mode];
      expect(makeLinter(DEFAULT_SETTINGS, null, extractCode).lintText(sample.text, path)).toEqual(cli.lintText(sample.text, path));
    });
  }

  it("has a first sample that breaks many rules, and an STE version of it with no findings", () => {
    const [problems, fixed] = SAMPLES;
    const rules = new Set(cli.lintText(problems!.text, "a.md").map((f) => f.ruleId));
    expect(rules.size).toBeGreaterThanOrEqual(8);
    expect(cli.lintText(fixed!.text, "a.md").map((f) => f.message)).toEqual([]);
  });

  it("gives the settings to the configuration", () => {
    expect(configFile(DEFAULT_SETTINGS)).toEqual({});
    const settings = { ...DEFAULT_SETTINGS, technicalNouns: ["memory usage"], limits: { ...DEFAULT_SETTINGS.limits, descriptionWords: 8 } };
    expect(configFile(settings)).toEqual({ technicalNouns: ["memory usage"], limits: { descriptionWords: 8 } });
    const text = "The tool reads the file and then it writes the report.";
    expect(makeLinter(DEFAULT_SETTINGS).lintText(text, "a.md")).toEqual([]);
    expect(makeLinter(settings).lintText(text, "a.md").map((f) => f.ruleId)).toEqual(["sentence-length"]);
  });
});

describe("the model of the findings", () => {
  const text = "Line one.\nYou should utilize it; ok.\n";
  const findings = viewFindings(text, cli.lintText(text, "a.md"), DEFAULT_WORD_LIST);

  it("changes lines and columns into offsets", () => {
    const starts = lineStarts(text);
    expect(starts).toEqual([0, 10, 37]);
    expect(toOffset(starts, 2, 5)).toBe(14);
    expect(findings.map((f) => f.excerpt)).toEqual(["should", "utilize", ";"]);
    expect(findings.map((f) => text.slice(f.start, f.end))).toEqual(["should", "utilize", ";"]);
  });

  it("gives the suggested words and the fixes", () => {
    const [modal, word, semi] = findings;
    expect(modal!.suggestions).toEqual(["must", "if"]);
    expect(modal!.fixes).toEqual([]);
    expect(word!.entryId).toBe("utilize");
    expect(word!.suggestions).toEqual(["use"]);
    expect(word!.fixes).toEqual([{ label: 'Write "use"', text: "use" }]);
    expect(semi!.suggestions).toEqual([]);
  });

  it("reads the suggestions of the messages", () => {
    expect(suggestionsFromMessage('Do not use the Latin abbreviation "e.g.". Write "for example".')).toEqual(["for example"]);
    expect(suggestionsFromMessage('Write "they" or "it", or write the noun again.')).toEqual(["they", "it"]);
    expect(suggestionsFromMessage("Do not use a semicolon.")).toEqual([]);
    expect(entryFor("In  Order to", DEFAULT_WORD_LIST)?.id).toBe("in order to");
    expect(entryFor("banana", DEFAULT_WORD_LIST)).toBeNull();
    expect(matchCase("Utilize", "use")).toBe("Use");
    expect(matchCase("utilize", "use")).toBe("use");
  });

  it("applies a fix, and a removal keeps one space and the capital letter", () => {
    expect(applyFix("You utilize it.", { start: 4, end: 11 }, { label: "", text: "use" })).toEqual({ text: "You use it.", caret: 7 });
    expect(applyFix("Please close the tab.", { start: 0, end: 6 }, { label: "", text: "" }).text).toBe("Close the tab.");
    expect(applyFix("It is basically a parser.", { start: 6, end: 15 }, { label: "", text: "" }).text).toBe("It is a parser.");
    expect(applyFix("Open it, simply.", { start: 9, end: 15 }, { label: "", text: "" }).text).toBe("Open it,.");
  });

  it("divides the text at each finding, also where findings overlap", () => {
    const long = "The tool reads each Markdown file of the project and examines the paragraphs, the list items, the headings and the table cells, and then it should give a list.";
    const view = viewFindings(long, cli.lintText(long, "a.md"), DEFAULT_WORD_LIST);
    expect(view.map((f) => f.ruleId).sort()).toEqual(["modal-verb", "sentence-length"]);
    const parts = segments(long, view);
    expect(parts.map((p) => long.slice(p.start, p.end)).join("")).toBe(long);
    const should = parts.find((p) => long.slice(p.start, p.end) === "should")!;
    expect(should.ids).toHaveLength(2);
    expect(should.severity).toBe("error");
    expect(findingsAt(view, long.indexOf("should") + 2)).toHaveLength(2);
  });

  it("counts the findings by rule, the most frequent rule first", () => {
    const sample = SAMPLES[0]!.text;
    const tally = tallyByRule(cli.lintText(sample, "a.md"));
    expect(tally[0]!.ruleId).toBe("word-list");
    expect(tally.reduce((n, t) => n + t.total, 0)).toBe(cli.lintText(sample, "a.md").length);
    for (let i = 1; i < tally.length; i++) expect(tally[i - 1]!.total).toBeGreaterThanOrEqual(tally[i]!.total);
  });

  it("puts the text and the mode in a link, and reads them again", () => {
    const share = encodeShare("Ünïcode text — ok\nline 2", "mdx");
    expect(share).toMatch(/^mode=mdx&text=[A-Za-z0-9_-]+$/);
    expect(decodeShare(`?${share}`)).toEqual({ text: "Ünïcode text — ok\nline 2", mode: "mdx" });
    expect(decodeShare("?text=%%%")).toBeNull();
    expect(decodeShare("?mode=doc")).toBeNull();
  });

  it("moves the marks with the text after an edit, and removes the marks that the edit touches", () => {
    const before = "You should utilize it; ok.";
    const view = viewFindings(before, cli.lintText(before, "a.md"), DEFAULT_WORD_LIST);
    const moved = shiftFindings(before, `Now ${before}`, view);
    expect(moved.map((f) => `Now ${before}`.slice(f.start, f.end))).toEqual(["should", "utilize", ";"]);
    const touched = shiftFindings(before, "You should use it; ok.", view);
    expect(touched.map((f) => "You should use it; ok.".slice(f.start, f.end))).toEqual(["should", ";"]);
  });
});

describe("typographic", () => {
  it("changes each pair of straight quotes to an opening and a closing quote", () => {
    expect(typographic(`Write "use", not "utilize".`)).toBe("Write “use”, not “utilize”.");
    expect(typographic(`Do not use the modal verb "should". Write "must" for an obligation.`)).toBe("Do not use the modal verb “should”. Write “must” for an obligation.");
  });
  it("keeps a text with no pair of quotes", () => {
    expect(typographic("No quotes here.")).toBe("No quotes here.");
    expect(typographic(`One " quote`)).toBe(`One " quote`);
  });
});
