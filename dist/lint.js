/**
 * The lint engine. It extracts the prose of a file, runs the rules on each
 * prose unit, and gives the findings with their lines and columns.
 */
import { readFileSync } from "node:fs";
import { buildLexicon } from "./lexicon.js";
import { RULES } from "./rules/index.js";
import { WordListMatcher } from "./rules/word-list-matcher.js";
import { LineIndex } from "./source/lines.js";
import { extractMarkdown } from "./source/markdown.js";
import { isSuppressed } from "./source/suppressions.js";
import { extractTsdoc } from "./source/tsdoc.js";
import { extractJsxText } from "./source/jsx.js";
import { buildUnit } from "./units.js";
/** The kind of a file, from its extension, or null when the linter cannot read it. */
export function fileKind(path) {
    const lower = path.toLowerCase();
    if (lower.endsWith(".mdx"))
        return "mdx";
    if (lower.endsWith(".md") || lower.endsWith(".markdown"))
        return "markdown";
    if (/\.(?:[mc]?ts|tsx|[mc]?js|jsx)$/.test(lower) && !lower.endsWith(".d.ts"))
        return "typescript";
    return null;
}
/** A linter for one configuration. It makes the lexicon and the word list matcher one time. */
export class Linter {
    config;
    lexicon;
    wordList;
    rules;
    constructor(config, lexicon) {
        this.config = config;
        this.lexicon = lexicon ?? buildLexicon(config);
        this.wordList = new WordListMatcher(config.wordList);
        this.rules = RULES.flatMap((rule) => {
            const setting = config.rules[rule.id];
            if (setting === "off")
                return [];
            if (rule.id === "unknown-word" && this.lexicon.dictionary === null)
                return [];
            return [{ rule, override: setting ?? null }];
        });
    }
    /** The prose units of a file. */
    units(text, path) {
        return extract(text, path).blocks.flatMap((block) => buildUnit(block, this.lexicon) ?? []);
    }
    /** The findings in `text`. `path` gives the kind of file, and it is the file name in the findings. */
    lintText(text, path) {
        const extraction = extract(text, path);
        const lineIndex = new LineIndex(text);
        const raw = [];
        for (const block of extraction.blocks) {
            const unit = buildUnit(block, this.lexicon);
            if (unit === null)
                continue;
            const wordOnly = unit.kind !== "paragraph";
            for (const { rule, override } of this.rules) {
                if (wordOnly && rule.scope !== "word")
                    continue;
                rule.check(unit, {
                    config: this.config,
                    lexicon: this.lexicon,
                    wordList: this.wordList,
                    report: (report) => {
                        raw.push({
                            ruleId: rule.id,
                            severity: override ?? report.severity ?? rule.defaultSeverity,
                            start: report.start,
                            end: report.end,
                            message: report.message,
                        });
                    },
                });
            }
        }
        // An unknown word that another rule reports already gets no second finding.
        const others = raw.filter((finding) => finding.ruleId !== "unknown-word");
        const kept = raw.filter((finding) => finding.ruleId !== "unknown-word"
            || !others.some((other) => other.start < finding.end && finding.start < other.end));
        return kept
            .filter((finding) => !isSuppressed(extraction.suppressions, finding.ruleId, finding.start))
            .sort((a, b) => a.start - b.start || a.end - b.end || a.ruleId.localeCompare(b.ruleId))
            .map((finding) => {
            const start = lineIndex.position(finding.start);
            const end = lineIndex.position(Math.max(finding.start, finding.end));
            return {
                file: path,
                line: start.line,
                column: start.column,
                endLine: end.line,
                endColumn: end.column,
                ruleId: finding.ruleId,
                severity: finding.severity,
                message: finding.message,
            };
        });
    }
    /** The findings in a file on disk. `displayPath` is the file name in the findings. */
    lintFile(path, displayPath = path) {
        return this.lintText(readFileSync(path, "utf8"), displayPath);
    }
}
function extract(text, path) {
    const kind = fileKind(path);
    if (kind === "typescript") {
        const comments = extractTsdoc(text, path);
        if (!/\.[jt]sx$/i.test(path))
            return comments;
        // The text that the user interface shows
        return { blocks: [...comments.blocks, ...extractJsxText(text, path).blocks], suppressions: comments.suppressions };
    }
    if (kind === null)
        return { blocks: [], suppressions: [] };
    return extractMarkdown(text, { mdx: kind === "mdx" });
}
/** The findings in `text`, with a new linter. To lint many files, make one `Linter` and use it again. */
export function lintText(text, path, config, lexicon) {
    return new Linter(config, lexicon).lintText(text, path);
}
//# sourceMappingURL=lint.js.map