/**
 * The word sets that the rules use: the project glossary from the
 * configuration, the built-in word lists, and the local dictionary when
 * there is one.
 */
import type { ResolvedConfig } from "./config.js";
import type { Dictionary } from "./dictionary.js";
import { PhraseMatcher } from "./text/phrases.js";
export type Lexicon = {
    /** Single-word technical nouns, in lower case. */
    readonly technicalNouns: ReadonlySet<string>;
    /** Single-word technical verbs, in lower case. */
    readonly technicalVerbs: ReadonlySet<string>;
    /** Single-word proper nouns, in lower case. */
    readonly properNouns: ReadonlySet<string>;
    readonly allowedWords: ReadonlySet<string>;
    /** All glossary terms, single words and phrases, for the unknown-word rule. */
    readonly glossaryPhrases: PhraseMatcher;
    /** Multi-word technical nouns. The noun-cluster rule counts each one as one noun. */
    readonly technicalNounPhrases: PhraseMatcher;
    /** Multi-word proper nouns. Each one counts as one word (STE Rule 8.6). */
    readonly properNounPhrases: PhraseMatcher;
    /** Nouns for the noun-cluster rule. */
    readonly nouns: ReadonlySet<string>;
    /** Base forms of verbs for the imperative and missing-subject heuristics. */
    readonly verbs: ReadonlySet<string>;
    readonly dictionary: Dictionary | null;
};
/** This function makes the lexicon for a configuration and an optional dictionary. */
export declare function buildLexicon(config: ResolvedConfig, dictionary?: Dictionary | null): Lexicon;
/** True when the glossary permits the word: a technical noun or verb in any form, a proper noun, or a word of `allowedWords`. */
export declare function isGlossaryWord(word: string, lexicon: Lexicon): boolean;
//# sourceMappingURL=lexicon.d.ts.map