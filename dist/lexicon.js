/**
 * The word sets that the rules use: the project glossary from the
 * configuration, the built-in word lists, and the local dictionary when
 * there is one.
 */
import { hasLemmaIn } from "./text/grammar.js";
import { PhraseMatcher, splitPhrase } from "./text/phrases.js";
import { COMMON_NOUNS, COMMON_VERBS } from "./text/words.js";
function words(terms) {
    const single = new Set();
    const phrases = [];
    for (const term of terms) {
        const parts = splitPhrase(term);
        if (parts.length === 1)
            single.add(parts[0]);
        else if (parts.length > 1)
            phrases.push(parts.join(" "));
    }
    return { single, phrases };
}
/** This function makes the lexicon for a configuration and an optional dictionary. */
export function buildLexicon(config, dictionary = null) {
    const nouns = words(config.technicalNouns);
    const verbs = words(config.technicalVerbs);
    const proper = words(config.properNouns);
    const allowed = words(config.allowedWords);
    const glossaryPhrases = new PhraseMatcher();
    const technicalNounPhrases = new PhraseMatcher();
    // A name counts as one word only with its own capital letters: "Event Timing", but not "event timing".
    const properNounPhrases = new PhraseMatcher({ caseSensitive: true });
    for (const phrase of nouns.phrases) {
        glossaryPhrases.add(phrase, true);
        technicalNounPhrases.add(phrase, true);
    }
    for (const phrase of verbs.phrases)
        glossaryPhrases.add(phrase, true);
    for (const phrase of proper.phrases)
        glossaryPhrases.add(phrase, true);
    for (const name of config.properNouns) {
        if (name.trim().split(/\s+/).length > 1)
            properNounPhrases.add(name.trim(), true);
    }
    const verbSet = new Set([...COMMON_VERBS, ...verbs.single, ...(dictionary?.verbs ?? [])]);
    // A word that is often a verb counts as a noun only when the glossary or the dictionary says that it is a noun.
    const nounSet = new Set();
    for (const noun of COMMON_NOUNS)
        if (!verbSet.has(noun))
            nounSet.add(noun);
    for (const noun of [...nouns.single, ...proper.single, ...(dictionary?.nouns ?? [])])
        nounSet.add(noun);
    return {
        technicalNouns: nouns.single,
        technicalVerbs: verbs.single,
        properNouns: proper.single,
        allowedWords: allowed.single,
        glossaryPhrases,
        technicalNounPhrases,
        properNounPhrases,
        nouns: nounSet,
        verbs: verbSet,
        dictionary,
    };
}
/** True when the glossary permits the word: a technical noun or verb in any form, a proper noun, or a word of `allowedWords`. */
export function isGlossaryWord(word, lexicon) {
    return lexicon.properNouns.has(word)
        || lexicon.allowedWords.has(word)
        || hasLemmaIn(word, lexicon.technicalNouns)
        || hasLemmaIn(word, lexicon.technicalVerbs);
}
//# sourceMappingURL=lexicon.js.map