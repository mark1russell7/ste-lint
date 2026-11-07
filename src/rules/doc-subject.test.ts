import { describe, expect, it } from "vitest";
import { resolveConfig } from "../config.js";
import { Linter } from "../lint.js";
import { thirdPerson } from "./doc-subject.js";

const on = new Linter(resolveConfig({ rules : { "doc-subject" : "error" } }, { root : "/" }));
const lint = (comment : string, linter : Linter = on) =>
    linter.lintText(`${comment}\nexport const a = 1;\n`, "a.ts").filter((finding) => finding.ruleId === "doc-subject");
const found = (comment : string) : string[] => lint(comment).map((finding) => comment.split("\n")[finding.line - 1]!.slice(finding.column - 1, finding.endColumn - 1));

describe("doc-subject", () => {
    it("is off by default", () => {
        const linter = new Linter(resolveConfig({}, { root : "/" }));
        expect(lint("/** Subscribe to an event. */", linter)).toEqual([]);
    });

    it("reports a summary that starts with a verb in the imperative", () => {
        expect(found("/** Subscribe to an event. */")).toEqual(["Subscribe"]);
        expect(found("/** Get the remaining time of a key. */")).toEqual(["Get"]);
        expect(found("/**\n * Remove the head of the queue.\n */")).toEqual(["Remove"]);
        expect(found("/** Delete key, giving the deleted value. */")).toEqual(["Delete"]);
        expect(found("/** Check that the value is set. */")).toEqual(["Check"]);
        const [finding] = lint("/** Process the queue. */");
        expect(finding!.severity).toBe("error");
        expect(finding!.message).toContain("This function processes");
    });

    it("reports a verb after an adverb, also a verb that the lexicon does not have", () => {
        expect(found("/** Immediately emit all batched events. */")).toEqual(["emit"]);
        expect(found("/** Manually trigger the cleanup of expired entries. */")).toEqual(["trigger"]);
        expect(found("/** Automatically compact on each removal. */")).toEqual(["compact"]);
    });

    it("does not read a label before a dash or a colon as a verb", () => {
        expect(found("/** CircularList<T> - List with a ring buffer. */")).toEqual([]);
        expect(found("/** Default overflow policy: throw an error. */")).toEqual([]);
    });

    it("examines only the first sentence of the summary", () => {
        expect(found("/** This function gives the head. Use it before a flush. */")).toEqual([]);
        expect(found("/**\n * This function gives the head.\n *\n * Use it before a flush.\n * @remarks\n * Do not call it twice.\n */")).toEqual([]);
        expect(found("/**\n * The head.\n * @returns Give it to the queue.\n */")).toEqual([]);
        expect(found("/**\n * - Remove the head.\n */")).toEqual([]);
    });

    it("does not report a first word that is a noun", () => {
        expect(found("/** Map of the keys to the values. */")).toEqual([]);
        expect(found("/** Set that keeps the order. */")).toEqual([]);
        expect(found("/** Map gives the values. */")).toEqual([]);
        expect(found("/** Note: the value is kept. */")).toEqual([]);
        expect(found("/** Use cases: a cache and a queue. */")).toEqual([]);
        expect(found("/** Step `i` covers the columns. */")).toEqual([]);
        expect(found("/** Restart 0 always starts. */")).toEqual([]);
        expect(found("/** Step A has loops. */")).toEqual([]);
        expect(found("/** Test support of the formula language. */")).toEqual([]);
        expect(found("/** Compile errors, runtime errors and ignored mutants. */")).toEqual([]);
        expect(found("/** Example. */")).toEqual([]);
        expect(found("/** Set<T> - a set with no duplicates. */")).toEqual([]);
    });

    it("does not examine Markdown files", () => {
        expect(on.lintText("Subscribe to an event.", "doc.md").filter((finding) => finding.ruleId === "doc-subject")).toEqual([]);
    });

    it("gives the form of a verb after a subject", () => {
        expect(thirdPerson("get")).toBe("gets");
        expect(thirdPerson("process")).toBe("processes");
        expect(thirdPerson("retry")).toBe("retries");
        expect(thirdPerson("play")).toBe("plays");
        expect(thirdPerson("push")).toBe("pushes");
    });
});
