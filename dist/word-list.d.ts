/**
 * The project word list: plain-language substitutions for the documentation
 * of this repository. This list is the style guide of the project, written
 * for it. It is not a copy of the ASD-STE100 dictionary. The local
 * dictionary file (refer to `dictionary.ts`) does that job, and it is not
 * part of the repository at any time.
 *
 * Each entry has the words or phrases to find, the words to write instead,
 * and a severity. `ste.config.json` can add entries, change them, or set an
 * entry to "off".
 */
import type { Severity } from "./types.js";
export type WordListEntry = {
    /** A short name of the entry. A configuration entry with the same ID changes this entry. */
    readonly id: string;
    /** The words and phrases to find. The match ignores case. */
    readonly match: readonly string[];
    /** The words to write instead, as the message shows them. Null when the fix is to remove the word. */
    readonly suggest: string | null;
    /** More help for the message, or null. */
    readonly note: string | null;
    readonly severity: Severity;
    /**
     * True when the word can be a noun too. Then the rule reports the word
     * only when the words near it show a verb ("Run the tests", but not "a
     * test run").
     */
    readonly verbOnly: boolean;
    /** A special context: "reference" finds "see" only where it tells the reader to look at other text. */
    readonly context: "reference" | null;
};
/** The default word list. */
export declare const DEFAULT_WORD_LIST: readonly WordListEntry[];
//# sourceMappingURL=word-list.d.ts.map