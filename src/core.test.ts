import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as core from "./core.js";
import { extractCode } from "./source/code.js";
import { Linter, resolveConfig } from "./index.js";

const here = dirname(fileURLToPath(import.meta.url));

/** The relative imports and the package imports of each module that `entry` reaches. */
function importGraph(entry : string) : { modules : string[]; packages : string[] } {
    const seen = new Set<string>();
    const packages = new Set<string>();
    const visit = (file : string) : void => {
        if (seen.has(file)) return;
        seen.add(file);
        const text = readFileSync(file, "utf8");
        // Type-only imports are erased, so they do not count.
        for (const match of text.matchAll(/^(?:import|export)\s+(?!type\b)[^;]*?from\s+"([^"]+)"/gms)) {
            const specifier = match[1]!;
            if (specifier.startsWith(".")) visit(join(dirname(file), specifier.replace(/\.js$/, ".ts")));
            else packages.add(specifier);
        }
    };
    visit(join(here, entry));
    return { modules : [...seen], packages : [...packages] };
}

const FIXTURE = [
    "# Getting started",
    "",
    "You should utilize the CLI in order to check the docs; it is basically simple.",
    "The values are about 5 ms, e.g. in the test run.",
    "",
    "Please make sure that the file is deleted. Stop the tool by closing the tab.",
    "",
    "- The user can edit his settings via the menu.",
    "",
    "<!-- ste-disable-next modal-verb -->",
    "You should not see this modal verb.",
    "",
].join("\n");

describe("the core entry", () => {
    it("imports no Node module and not the TypeScript compiler", () => {
        const { packages, modules } = importGraph("core.ts");
        expect(packages).toEqual([]);
        expect(modules.length).toBeGreaterThan(20);
    });

    it("lets the code extractor import the compiler, but no Node module", () => {
        expect(importGraph("source/code.ts").packages).toEqual(["typescript"]);
    });

    it("gives the same Markdown findings as the linter of the command line", () => {
        const config = resolveConfig({}, { root : "/" });
        const cli = new Linter(config).lintText(FIXTURE, "README.md");
        const browser = new core.ProseLinter(core.baseConfig()).lintText(FIXTURE, "README.md");
        expect(browser).toEqual(cli);
        expect(new Set(cli.map((finding) => finding.ruleId))).toEqual(new Set([
            "modal-verb", "semicolon", "word-list", "about-quantity", "latin-abbreviation", "gendered-pronoun", "ing-verb",
        ]));
    });

    it("gives the same doc comment findings with the code extractor", () => {
        const source = "/** Returns the value. You should utilize it. */\nexport const x = 1;\n";
        const cli = new Linter(resolveConfig({}, { root : "/" })).lintText(source, "a.ts");
        const browser = new core.ProseLinter(core.baseConfig(), undefined, { extractCode }).lintText(source, "a.ts");
        expect(browser).toEqual(cli);
        expect(cli.map((finding) => finding.ruleId)).toContain("missing-subject");
        expect(new core.ProseLinter(core.baseConfig()).lintText(source, "a.ts")).toEqual([]);
    });

    it("applies the settings of a configuration file and a dictionary", () => {
        const config = core.baseConfig({ rules : { "modal-verb" : "off" } });
        expect(new core.ProseLinter(config).lintText("You should stop.", "a.md")).toEqual([]);
        const dictionary = core.parseDictionary(["you", "stop", "the"], "words.json");
        const linter = new core.ProseLinter(core.baseConfig(), core.buildLexicon(core.baseConfig(), dictionary));
        expect(linter.lintText("You stop the valve.", "a.md").map((finding) => finding.ruleId)).toEqual(["unknown-word"]);
    });

    it("gives the same configuration as resolveConfig without a dictionary", () => {
        const file = { technicalNouns : ["valve"], limits : { instructionWords : 12 } };
        expect(core.baseConfig(file, { root : "/" })).toEqual(resolveConfig(file, { root : "/" }));
    });
});
