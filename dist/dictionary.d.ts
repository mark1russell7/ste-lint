/**
 * The optional local dictionary of approved words.
 *
 * The ASD-STE100 dictionary is copyrighted. This package does not contain
 * it, and the repository must not contain it. Each user makes a local file
 * from their own copy of the standard. Keep that file outside the
 * repository, or in a git-ignored folder, for example `.ste/`.
 *
 * File format (JSON). The short form is an array of approved words:
 *
 * ```json
 * ["a", "about", "make", "makes", "made"]
 * ```
 *
 * The full form is an object with entries:
 *
 * ```json
 * {
 *   "format": "ste-lint-dictionary",
 *   "version": 1,
 *   "entries": [
 *     { "word": "make", "pos": "verb", "forms": ["makes", "made"] },
 *     { "word": "valve", "pos": "noun" },
 *     { "word": "utilize", "pos": "verb", "approved": false, "alternatives": ["use"] }
 *   ]
 * }
 * ```
 *
 * - `word` (necessary): the headword. A phrase, for example "make sure", approves each of its words.
 * - `pos`: the part of speech. A noun also permits its regular plural.
 * - `approved`: `false` for a word that is not approved. The default is `true`.
 * - `forms`: other approved forms, for example the past tense of a verb.
 * - `alternatives`: approved words to use instead of a word that is not approved.
 */
export type DictionaryEntry = {
    readonly word: string;
    readonly pos?: string;
    readonly approved?: boolean;
    readonly forms?: readonly string[];
    readonly alternatives?: readonly string[];
};
export type DictionaryLookup = {
    readonly status: "approved";
} | {
    readonly status: "not-approved";
    readonly alternatives: readonly string[];
} | {
    readonly status: "unknown";
};
export declare const DICTIONARY_FORMAT = "ste-lint-dictionary";
/** An error in a dictionary file. */
export declare class DictionaryError extends Error {
    readonly name: string;
}
/** The approved words of a local dictionary. */
export declare class Dictionary {
    private readonly approved;
    private readonly approvedNouns;
    private readonly notApproved;
    /** The approved nouns. The noun-cluster rule uses them. */
    readonly nouns: Set<string>;
    /** The approved verbs. The imperative and missing-subject heuristics use them. */
    readonly verbs: Set<string>;
    constructor(entries: readonly DictionaryEntry[]);
    /** The number of approved words and forms. */
    get size(): number;
    /** The status of `word` in the dictionary. */
    lookup(word: string): DictionaryLookup;
}
/** This function makes a dictionary from parsed JSON. `source` is the file name for error messages. */
export declare function parseDictionary(value: unknown, source: string): Dictionary;
/** This function reads a dictionary file. */
export declare function loadDictionary(path: string): Dictionary;
//# sourceMappingURL=dictionary.d.ts.map