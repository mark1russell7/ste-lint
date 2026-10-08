import type { Lexicon } from "../lexicon.js";
import { type Token } from "../text/tokens.js";
import { type Rule } from "./rule.js";
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