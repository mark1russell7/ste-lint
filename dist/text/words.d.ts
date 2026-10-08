/**
 * Closed word classes and short word lists for the grammar heuristics.
 *
 * These lists are general English grammar. They do not come from the
 * ASD-STE100 dictionary. The linter cannot tag parts of speech, so the
 * heuristics look at the words near a word to guess how the text uses it.
 */
export declare const DETERMINERS: ReadonlySet<string>;
export declare const SUBJECT_PRONOUNS: ReadonlySet<string>;
export declare const OBJECT_PRONOUNS: ReadonlySet<string>;
/** Forms of "be", with the contractions that contain "is", "are" or "am". */
export declare const BE_FORMS: ReadonlySet<string>;
/** Words before a past participle that make a passive: forms of "be" and "get". */
export declare const PASSIVE_AUXILIARIES: ReadonlySet<string>;
export declare const HAVE_FORMS: ReadonlySet<string>;
export declare const DO_FORMS: ReadonlySet<string>;
export declare const MODALS: ReadonlySet<string>;
export declare const PREPOSITIONS: ReadonlySet<string>;
export declare const CONJUNCTIONS: ReadonlySet<string>;
/** Words that start a condition or purpose clause before the main clause. */
export declare const CLAUSE_STARTERS: ReadonlySet<string>;
/** Words that can come before the verb of an imperative sentence. */
export declare const LEADING_ADVERBS: ReadonlySet<string>;
/** Adverbs that can come between an auxiliary verb and a participle. */
export declare const MIDDLE_ADVERBS: ReadonlySet<string>;
/** Words that tell the reader that a clause is a condition, so a participle after "be" is a state. */
export declare const CONDITION_MARKERS: ReadonlySet<string>;
export declare const PARTICLES: ReadonlySet<string>;
export declare const NUMBER_WORDS: ReadonlySet<string>;
/** Units of measurement. A number and its unit count as one word (STE Rule 8.6). */
export declare const UNITS: ReadonlySet<string>;
/**
 * Words that end in "-ing" but are usually not verb forms: nouns, adjectives,
 * prepositions, and base forms, for example "bring".
 */
export declare const NON_VERB_ING: ReadonlySet<string>;
/** Irregular past participles. A participle after "be" makes a passive. */
export declare const IRREGULAR_PARTICIPLES: ReadonlySet<string>;
/** Words that end in "-ed" but are not past participles. */
export declare const NOT_PARTICIPLE_ED: ReadonlySet<string>;
/**
 * Common verbs in their base form. The imperative heuristic and the
 * missing-subject heuristic use this list. The project glossary adds
 * technical verbs to it.
 */
export declare const COMMON_VERBS: ReadonlySet<string>;
/**
 * Nouns that software text often uses before another noun. The noun-cluster
 * heuristic counts only these words, technical nouns, proper nouns,
 * abbreviations and code. Words that are frequently verbs are not in this
 * list, so the heuristic does not count a verb as a noun.
 */
export declare const COMMON_NOUNS: ReadonlySet<string>;
/** Abbreviations after which a period does not end a sentence. */
export declare const NO_BREAK_ABBREVIATIONS: ReadonlySet<string>;
/** Abbreviations that do not end a sentence when a number comes after them, for example "Fig. 3". */
export declare const NUMBER_ABBREVIATIONS: ReadonlySet<string>;
//# sourceMappingURL=words.d.ts.map