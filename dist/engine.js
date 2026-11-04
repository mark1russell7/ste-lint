/**
 * The lint engine without a file system. It extracts the prose of a text,
 * runs the rules on each prose unit, and gives the findings with their lines
 * and columns. A browser can use this module.
 */
import { buildLexicon } from "./lexicon.js";
import { RULES } from "./rules/index.js";
import { WordListMatcher } from "./rules/word-list-matcher.js";
import { LineIndex } from "./source/lines.js";
import { extractMarkdown } from "./source/markdown.js";
import { isSuppressed } from "./source/suppressions.js";
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
/**
 * A linter for one configuration, for text in memory. It makes the lexicon
 * and the word list matcher one time. It reads no file.
 */
export class ProseLinter {
    lexicon;
    wordList;
    rules;
    extractCode;
    config;
    constructor(config, lexicon, options = {}) {
        this.config = config;
        this.lexicon = lexicon ?? buildLexicon(config);
        this.wordList = new WordListMatcher(config.wordList);
        this.extractCode = options.extractCode ?? null;
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
        return this.extract(text, path).blocks.flatMap((block) => buildUnit(block, this.lexicon) ?? []);
    }
    /** The findings in `text`. `path` gives the kind of file, and it is the file name in the findings. */
    lintText(text, path) {
        const extraction = this.extract(text, path);
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
                            eachWord: reportsEachWord(rule),
                        });
                    },
                });
            }
        }
        // An unknown word that another rule reports already gets no second finding. A finding for a
        // sentence, a paragraph or a noun cluster does not report each word in it.
        const others = raw.filter((finding) => finding.ruleId !== "unknown-word" && finding.eachWord);
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
    extract(text, path) {
        const kind = fileKind(path);
        if (kind === "typescript")
            return this.extractCode === null ? { blocks: [], suppressions: [] } : this.extractCode(text, path);
        if (kind === null)
            return { blocks: [], suppressions: [] };
        return extractMarkdown(text, { mdx: kind === "mdx" });
    }
}
/**
 * True when a finding of the rule is about each word in its range. A word rule reports a word or a
 * phrase, for example a modal verb or a word list phrase. The noun-cluster rule reports a group of
 * nouns, and the sentence and paragraph rules report a full sentence or paragraph.
 */
function reportsEachWord(rule) {
    return rule.scope === "word" && rule.id !== "noun-cluster";
}
//# sourceMappingURL=engine.js.map