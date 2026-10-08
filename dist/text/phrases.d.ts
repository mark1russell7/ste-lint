import { type Token } from "./tokens.js";
export type PhraseMatcherOptions = {
    /** Match the case of each letter. For example, the name "Event Timing" must not match "event timing". */
    readonly caseSensitive?: boolean;
};
/**
 * A set of words and multi-word phrases. A phrase matches consecutive word
 * tokens, without case by default. Punctuation and placeholders between the
 * words stop a match.
 */
export declare class PhraseMatcher<T = true> {
    private readonly byFirstWord;
    private readonly caseSensitive;
    constructor(options?: PhraseMatcherOptions);
    private key;
    /** This method adds a phrase. A later phrase with the same words replaces the earlier one. */
    add(phrase: string, value: T): void;
    /** The longest phrase that starts at `tokens[index]`, or null. */
    match(tokens: readonly Token[], index: number): {
        readonly length: number;
        readonly value: T;
    } | null;
    /** The number of tokens in the longest phrase that starts at `tokens[index]`, or 0. */
    longestMatch(tokens: readonly Token[], index: number): number;
    /** True when the matcher has no phrases. */
    get empty(): boolean;
}
/** The lower-case words of a phrase. */
export declare function splitPhrase(phrase: string): string[];
//# sourceMappingURL=phrases.d.ts.map