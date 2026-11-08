import { extractCode } from "@mark1russell7/ste-lint/code";
import { describe, expect, it } from "vitest";
import { buildCatalog } from "./catalog.ts";
import { exampleRequest, loadCodeExtractor, makeLinter, DEFAULT_SETTINGS } from "./lint.ts";
import { MODE_PATH } from "./model.ts";

const docSubject = buildCatalog().find((item) => item.kind === "rule" && item.id === "doc-subject")!.example!;

describe("the request of the button Try in the playground", () => {
  it("keeps the rules of the example, so the playground finds what the explorer shows", () => {
    const request = exampleRequest(docSubject);
    expect(request.rules).toEqual({ "doc-subject": "error" });
    const found = makeLinter(DEFAULT_SETTINGS, null, extractCode, request.rules).lintText(request.text, MODE_PATH[request.mode]);
    expect(found.map((finding) => finding.ruleId)).toContain("doc-subject");
    // The request of 0.2.0 had no rules: the same text then gets no finding of the rule.
    const before = makeLinter(DEFAULT_SETTINGS, null, extractCode).lintText(request.text, MODE_PATH[request.mode]);
    expect(before.map((finding) => finding.ruleId)).not.toContain("doc-subject");
  });

  it("has no rules for an example of a rule that is on by default", () => {
    const missing = buildCatalog().find((item) => item.kind === "rule" && item.id === "missing-subject")!.example!;
    expect("rules" in exampleRequest(missing)).toBe(false);
  });
});

describe("loadCodeExtractor", () => {
  it("gives null when the import fails, so a later call tries again", async () => {
    let calls = 0;
    const failing = async (): Promise<never> => {
      calls += 1;
      throw new TypeError("Failed to fetch dynamically imported module");
    };
    await expect(loadCodeExtractor(failing)).resolves.toBeNull();
    await expect(loadCodeExtractor(failing)).resolves.toBeNull();
    expect(calls).toBe(2);
  });

  it("gives the extractor when the import succeeds", async () => {
    await expect(loadCodeExtractor(async () => ({ extractCode }))).resolves.toBe(extractCode);
  });
});
