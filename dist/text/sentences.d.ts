/**
 * Sentence division and STE word counting (STE Rules 8.4 to 8.7).
 */
import type { PhraseMatcher } from "./phrases.js";
import { type Token } from "./tokens.js";
/** A range of tokens: `from` is the first token, `to` is the token after the last one. */
export type TokenRange = {
    readonly from: number;
    readonly to: number;
};
/**
 * This function divides tokens into sentences. A sentence stops at `.`,
 * `!`, `?` or an ellipsis, when white space comes next. After the white
 * space, there must be a capital letter, a digit, a placeholder, or an
 * opening bracket or quote. Closing brackets and quotes after the stop stay
 * in the sentence. A period after an abbreviation, for example `e.g.`, does
 * not stop a sentence.
 */
export declare function splitSentences(tokens: readonly Token[]): TokenRange[];
/** The pairs of matching parentheses that no other pair contains. A parenthesis without a partner is ignored. */
export declare function topLevelParentheses(tokens: readonly Token[]): TokenRange[];
export type WordCount = {
    /** The STE word count of the sentence. */
    readonly words: number;
    /** The tokens in each top-level parenthesis that has words. Each one is a separate sentence (STE Rule 8.5). */
    readonly parentheticals: readonly (readonly Token[])[];
};
export type CountOptions = {
    /** Multi-word proper nouns and technical nouns that count as one word. */
    readonly properNouns: PhraseMatcher;
};
/**
 * This function counts the words of a sentence as STE Rules 8.5 to 8.7
 * tell:
 *
 * - A placeholder (code span, link tag, URL, quoted text) is one word.
 * - A hyphenated word is one word.
 * - A number and its unit, for example `20 ms`, are one word.
 * - A multi-word proper noun from the glossary is one word.
 * - Two or more words with capital letters after the start of the
 *   sentence are a name or a title. They count as one word.
 * - Text in parentheses is one word. Its words make a separate sentence.
 */
export declare function countWords(tokens: readonly Token[], options: CountOptions): WordCount;
//# sourceMappingURL=sentences.d.ts.map