import { type Rule } from "./rule.js";
/**
 * The rule counts a group of nouns in sequence, with no article,
 * preposition or punctuation between them. Only these known nouns count:
 *
 * - Technical nouns and proper nouns from the glossary
 * - Nouns from the dictionary
 * - A built-in list of common software nouns
 * - Abbreviations and code.
 *
 * Only the last noun of a group can be plural. Without a part-of-speech
 * tagger, the rule cannot know if other words are nouns, so it does not
 * count them. Thus it misses some clusters, but it seldom reports a false
 * one.
 */
export declare const nounCluster: Rule;
//# sourceMappingURL=noun-cluster.d.ts.map