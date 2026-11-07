/**
 * The lint engine without a file system. It extracts the prose of a text,
 * runs the rules on each prose unit, and gives the findings with their lines
 * and columns. A browser can use this module.
 */

import type { ResolvedConfig } from "./config-core.js";
import { buildLexicon, type Lexicon } from "./lexicon.js";
import { RULES, type Rule } from "./rules/index.js";
import { WordListMatcher } from "./rules/word-list-matcher.js";
import { LineIndex } from "./source/lines.js";
import { extractMarkdown, type Extraction } from "./source/markdown.js";
import { isSuppressed } from "./source/suppressions.js";
import type { Finding, RuleId, Severity } from "./types.js";
import { buildUnit, type ProseUnit } from "./units.js";

export type FileKind = "markdown" | "mdx" | "typescript";

/** The kind of a file, from its extension, or null when the linter cannot read it. */
export function fileKind(path : string) : FileKind | null {
    const lower = path.toLowerCase();
    if (lower.endsWith(".mdx")) return "mdx";
    if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
    if (/\.(?:[mc]?ts|tsx|[mc]?js|jsx)$/.test(lower) && !lower.endsWith(".d.ts")) return "typescript";
    return null;
}

/**
 * A function that extracts the prose of a TypeScript or JavaScript file:
 * the doc comments, and the JSX text of a TSX or JSX file.
 */
export type CodeExtractor = (text : string, path : string) => Extraction;

export type ProseLinterOptions = {
    /**
     * The extractor for TypeScript and JavaScript files. Without it, the
     * linter gives no findings for these files. The extractor of this
     * package (`extractCode`) needs the `typescript` package.
     */
    readonly extractCode? : CodeExtractor;
};

/**
 * A linter for one configuration, for text in memory. It makes the lexicon
 * and the word list matcher one time. It reads no file.
 */
export class ProseLinter {
    readonly lexicon : Lexicon;
    private readonly wordList : WordListMatcher;
    private readonly rules : ReadonlyArray<{ readonly rule : Rule; readonly override : Severity | null }>;
    private readonly extractCode : CodeExtractor | null;
    readonly config : ResolvedConfig;

    constructor(config : ResolvedConfig, lexicon? : Lexicon, options : ProseLinterOptions = {}) {
        this.config = config;
        this.lexicon = lexicon ?? buildLexicon(config);
        this.wordList = new WordListMatcher(config.wordList);
        this.extractCode = options.extractCode ?? null;
        this.rules = RULES.flatMap((rule) => {
            const setting = config.rules[rule.id];
            if (setting === "off" || (setting === undefined && rule.enabledByDefault === false)) return [];
            if (rule.id === "unknown-word" && this.lexicon.dictionary === null) return [];
            return [{ rule, override : setting ?? null }];
        });
    }

    /** The prose units of a file. */
    units(text : string, path : string) : ProseUnit[] {
        return this.extract(text, path).blocks.flatMap((block) => buildUnit(block, this.lexicon) ?? []);
    }

    /** The findings in `text`. `path` gives the kind of file, and it is the file name in the findings. */
    lintText(text : string, path : string) : Finding[] {
        const extraction = this.extract(text, path);
        const lineIndex = new LineIndex(text);
        type Raw = { ruleId : RuleId; severity : Severity; start : number; end : number; message : string; eachWord : boolean };
        const raw : Raw[] = [];
        for (const block of extraction.blocks) {
            const unit = buildUnit(block, this.lexicon);
            if (unit === null) continue;
            const wordOnly = unit.kind !== "paragraph";
            for (const { rule, override } of this.rules) {
                if (wordOnly && rule.scope !== "word") continue;
                rule.check(unit, {
                    config : this.config,
                    lexicon : this.lexicon,
                    wordList : this.wordList,
                    report : (report) => {
                        raw.push({
                            ruleId : rule.id,
                            severity : override ?? report.severity ?? rule.defaultSeverity,
                            start : report.start,
                            end : report.end,
                            message : report.message,
                            eachWord : reportsEachWord(rule),
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
                    file : path,
                    line : start.line,
                    column : start.column,
                    endLine : end.line,
                    endColumn : end.column,
                    ruleId : finding.ruleId,
                    severity : finding.severity,
                    message : finding.message,
                };
            });
    }

    private extract(text : string, path : string) : Extraction {
        const kind = fileKind(path);
        if (kind === "typescript") return this.extractCode === null ? { blocks : [], suppressions : [] } : this.extractCode(text, path);
        if (kind === null) return { blocks : [], suppressions : [] };
        return extractMarkdown(text, { mdx : kind === "mdx" });
    }
}

/**
 * True when a finding of the rule is about each word in its range. A word rule reports a word or a
 * phrase, for example a modal verb or a word list phrase. The noun-cluster rule reports a group of
 * nouns, and the sentence and paragraph rules report a full sentence or paragraph.
 */
function reportsEachWord(rule : Rule) : boolean {
    return rule.scope === "word" && rule.id !== "noun-cluster";
}
