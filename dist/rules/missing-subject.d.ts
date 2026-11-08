import type { Lexicon } from "../lexicon.js";
import { type Token } from "../text/tokens.js";
import { type Rule } from "./rule.js";
/** The base forms that an `-s` word can come from: "gives" gives "give" and "giv". */
export declare function stems(word: string): string[];
/** The start of a summary sentence: the index of the word where its verb can be, and the words before it. */
export type SummaryStart = {
    readonly index: number;
    /** True when a label or an adverb comes before the word. */
    readonly shifted: boolean;
    /** True when a label and a dash or a colon come before the word: "Bounded behavior - Enforces ...". */
    readonly label: boolean;
    /** True when an adverb of the word lists comes immediately before the word, for example "automatically". Then an unknown word is a verb. */
    readonly listedAdverb: boolean;
};
/**
 * This function finds the word where the verb of a summary sentence can be. It skips the adverbs before a verb:
 * "Automatically resizes the table.". With `labels`, it also skips a label of at most four words before a dash
 * or a colon: "Bounded behavior - Enforces limits.".
 */
export declare function summaryStart(tokens: readonly Token[], lexicon: Lexicon, labels: boolean): SummaryStart;
/** The message when the sentence at `tokens` starts without a subject, or null. */
export declare function missingSubject(tokens: readonly Token[], lexicon: Lexicon): {
    index: number;
    message: string;
} | null;
/**
 * The rule examines the summary and the `@remarks` text of doc comments.
 * For example, "Returns the value." and "Called when the page is hidden."
 * omit the subject. Text after `@param` and `@returns`, and list items, can
 * be fragments, so the rule does not examine them.
 */
export declare const missingSubjectRule: Rule;
//# sourceMappingURL=missing-subject.d.ts.map