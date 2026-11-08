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
/** A sentence with no subject: the index of its first word, and the message. */
type SubjectFault = {
    index: number;
    message: string;
};
/**
 * This function gives the message when the sentence at `tokens` starts without a subject, or null.
 * A label has a capitalized word after its mark: "Note: Returns ...". When a lowercase word follows the mark,
 * the words before the mark can be the sentence: "Returns the mode: read or write.". Then the function
 * also examines the sentence with no label, and a fault there wins.
 */
export declare function missingSubject(tokens: readonly Token[], lexicon: Lexicon): SubjectFault | null;
/**
 * The rule examines the summary and the `@remarks` text of doc comments.
 * For example, "Returns the value." and "Called when the page is hidden."
 * omit the subject. Text after `@param` and `@returns`, and list items, can
 * be fragments, so the rule does not examine them.
 */
export declare const missingSubjectRule: Rule;
export {};
//# sourceMappingURL=missing-subject.d.ts.map