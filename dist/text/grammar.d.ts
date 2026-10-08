/**
 * Grammar heuristics. The linter has no part-of-speech tagger. These
 * functions look at the words near a word to guess its function. Each
 * heuristic prefers to miss a problem than to report a false one.
 */
import { type Token } from "./tokens.js";
/**
 * The possible base forms of a word: the word itself, and the word without
 * the endings -s, -es, -ies, -ed, -d, -ied and -ing. The list can contain
 * forms that are not words. The callers look up each form in a word list.
 */
export declare function lemmas(word: string): string[];
/** True when one of the base forms of `word` is in `words`. */
export declare function hasLemmaIn(word: string, words: ReadonlySet<string>): boolean;
/** True when `word` can be a past participle: an irregular participle, or a word that ends in -ed. */
export declare function isParticiple(word: string): boolean;
/** True for a word that is an auxiliary verb: a form of "be", "have" or "do", or a modal verb. */
export declare function isAuxiliary(token: Token | undefined): boolean;
/** The index of the next token that is a word or a placeholder, or -1. */
export declare function nextCounted(tokens: readonly Token[], from: number): number;
/** True when the token can start the object of a verb: a determiner, a pronoun, a number, a placeholder or an adverb. */
export declare function startsObject(token: Token | undefined): boolean;
export type ImperativeOptions = {
    /** Base forms of verbs, for example the common verbs and the technical verbs of the glossary. */
    readonly verbs: ReadonlySet<string>;
};
/**
 * True when the sentence is an instruction (imperative). The heuristic:
 *
 * 1. Skip the adverbs at the start, for example "then", "first" and "please".
 * 2. If the sentence starts with a condition or purpose clause ("If ...,",
 *    "To ...,", "When ...,"), continue after the first comma.
 * 3. "Do not", "Never", "Make sure" and "Be sure" start an instruction.
 * 4. Otherwise, the first word must be the base form of a known verb. The
 *    next words must not show that the first word is a noun subject. Thus,
 *    the next word is not an auxiliary verb or "of". Also, the next two
 *    words are not a plural noun and a verb ("Test runs take 5 s").
 */
export declare function isInstruction(tokens: readonly Token[], options: ImperativeOptions): boolean;
export type VerbUseOptions = {
    readonly verbs: ReadonlySet<string>;
};
/**
 * True when the word at `index` is likely a verb, not a noun or an
 * adjective. The heuristic is conservative. It is true only when the words
 * near the word show a verb. It looks at these words:
 *
 * - The word before. These words show a verb: "to", a modal verb, a form
 *   of "do", a subject pronoun, a form of "be" or "have" (for participles).
 * - The start of the sentence, for an imperative
 * - The word after, for an -s form: an object, for example "the", a
 *   pronoun, code or a number
 * - A determiner before the word, which shows a noun ("the call", "a run").
 */
export declare function isVerbUse(tokens: readonly Token[], index: number, options: VerbUseOptions): boolean;
/**
 * True when the -ing word at `index` is a verb. The heuristic finds four
 * uses:
 *
 * - After a form of "be": "is running", "is still running"
 * - After a preposition, with an object: "by calling `stop()`", "after
 *   waiting for the worker"
 * - At the start of a clause, with an object: "Using the worker, ..."
 * - After a word that is not a determiner, with an object (a reduced
 *   clause): "a timer firing every 5 ms".
 *
 * A noun ("the timing") or an adjective before a noun ("existing code")
 * is not a verb use.
 */
export declare function isIngVerbUse(tokens: readonly Token[], index: number): boolean;
/** True when the token is the first word of the sentence or the first word after a comma, colon or opening parenthesis. */
export declare function isClauseStart(tokens: readonly Token[], index: number): boolean;
export type Passive = {
    /** The index of the first word of the construction: the modal verb, "has" in "has to be", or the form of "be". */
    readonly start: number;
    /** The index of the form of "be" or "get". */
    readonly auxiliary: number;
    /** The index of the past participle. */
    readonly participle: number;
    /** True when a modal verb or "has to", "needs to" or "is to" shows an obligation: "must be set". */
    readonly obligation: boolean;
    /** True when a modal verb or "to" comes before "be": "can be set", "to be set". */
    readonly modal: boolean;
    /** True when "by" comes after the participle. */
    readonly agent: boolean;
    /** True when a condition word ("if", "when", "make sure that") comes before, in the same clause. */
    readonly inCondition: boolean;
};
/** This function finds the passive constructions in a sentence: a form of "be" or "get" and a past participle. */
export declare function findPassives(tokens: readonly Token[]): Passive[];
//# sourceMappingURL=grammar.d.ts.map