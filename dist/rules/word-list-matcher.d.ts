import { type Token } from "../text/tokens.js";
import type { WordListEntry } from "../word-list.js";
export type WordListMatch = {
    readonly entry: WordListEntry;
    readonly from: number;
    readonly to: number;
};
/** True when "see" at `index` tells the reader to look at other text, not to see with the eyes. */
export declare function isReferenceSee(tokens: readonly Token[], index: number): boolean;
/** This class finds the entries of the word list in a sentence. */
export declare class WordListMatcher {
    private readonly phrases;
    /** The single words of the list. Other rules skip these words, so that a word gets one finding. */
    readonly words: ReadonlySet<string>;
    constructor(entries: readonly WordListEntry[]);
    /**
     * The matches in `tokens`. The longest phrase wins. `skipWord` tells the
     * matcher to ignore a single word, for example a glossary term.
     */
    find(tokens: readonly Token[], options: {
        readonly verbs: ReadonlySet<string>;
        readonly skipWord: (word: string) => boolean;
    }): WordListMatch[];
}
//# sourceMappingURL=word-list-matcher.d.ts.map