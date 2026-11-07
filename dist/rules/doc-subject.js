import { nextCounted, startsObject } from "../text/grammar.js";
import { isCapitalized, isCounted, isWord } from "../text/tokens.js";
import { BE_FORMS, DETERMINERS, HAVE_FORMS, MODALS, OBJECT_PRONOUNS, PREPOSITIONS, SUBJECT_PRONOUNS } from "../text/words.js";
import { stems } from "./missing-subject.js";
import { tokenRange } from "./rule.js";
/** Words after a first word that show a noun: "Order of the keys ...", "Samples per round ...", "Tags whose ...". */
const NOUN_FOLLOWERS = new Set(["of", "per", "whose", "which", "who", "whom", "and", "or"]);
/** Verb forms after a name that show a subject: "Step `i` covers ...", "Step A has ...". */
const FINITE_FORMS = new Set(["is", "are", "was", "were", "has", "have", "had"]);
/** True when `token` is a verb form that a subject comes before: "is", "has", a modal verb or a known `-s` verb. */
function isFiniteVerb(token, lexicon) {
    if (!isWord(token))
        return false;
    const lower = token.lower;
    if (FINITE_FORMS.has(lower) || MODALS.has(lower))
        return true;
    return /^[a-z]{3,}s$/.test(lower) && stems(lower).some((stem) => lexicon.verbs.has(stem));
}
/** True when `token` is a plain word: not a determiner, a pronoun, a preposition or an adverb in `-ly`. */
function isPlainWord(token) {
    if (!isWord(token))
        return false;
    const lower = token.lower;
    return !(DETERMINERS.has(lower) || OBJECT_PRONOUNS.has(lower) || SUBJECT_PRONOUNS.has(lower) || PREPOSITIONS.has(lower) || lower.endsWith("ly"));
}
/**
 * True when the words after the first word show that the first word is a noun, and not a verb in the
 * imperative. These words show a noun:
 *
 * - A form of "be" or "have", a modal verb, a known `-s` verb, or a word of `NOUN_FOLLOWERS`: "Map gives ...".
 * - "that" before a word that is not a subject: "List that keeps ...".
 * - A name and then a verb form or a colon: "Step `i` covers ...", "Restart 0 always starts ...", "Step 1: ...".
 * - A plain word and then "of", or a comma that is not before an `-ing` word: "Compile errors, runtime errors ...".
 * - A colon after at most three words, or the end of the sentence: "Use cases:", "Note:", "Example.".
 */
function showsNoun(tokens, index, lexicon) {
    const next = tokens[index + 1];
    const after = tokens[index + 2];
    if (next === undefined || (next.kind === "punct" && next.text !== ","))
        return true;
    const colon = tokens.findIndex((token) => token.kind === "punct" && token.text === ":");
    if (colon !== -1 && tokens.slice(index, colon).filter(isCounted).length <= 3)
        return true;
    if (next.kind === "code" || (isWord(next) && /^\d/.test(next.text)) || (isWord(next) && /^[A-Z]$/.test(next.text))) {
        const verb = isWord(after) && (after.lower.endsWith("ly") || after.lower === "always" || after.lower === "never") ? tokens[index + 3] : after;
        return isFiniteVerb(verb, lexicon) || (isWord(after) && after.lower === "of");
    }
    if (!isWord(next))
        return false;
    const lower = next.lower;
    if (BE_FORMS.has(lower) || HAVE_FORMS.has(lower) || isFiniteVerb(next, lexicon) || NOUN_FOLLOWERS.has(lower))
        return true;
    if (lower === "that")
        return !(startsObject(after) || (isWord(after) && SUBJECT_PRONOUNS.has(after.lower)));
    if (!isPlainWord(next) || after === undefined)
        return false;
    if (isWord(after) && after.lower === "of")
        return true;
    const third = tokens[index + 3];
    return after.text === "," && !(isWord(third) && /ing$/.test(third.lower));
}
/** The form of a verb after "This function": "get" gives "gets", "process" gives "processes", "retry" gives "retries". */
export function thirdPerson(verb) {
    if (/(s|sh|ch|x|z|o)$/.test(verb))
        return `${verb}es`;
    if (/[^aeiou]y$/.test(verb))
        return `${verb.slice(0, -1)}ies`;
    return `${verb}s`;
}
/** The index of the first word when the sentence at `tokens` starts with a verb in the imperative, or null. */
export function imperativeStart(tokens, lexicon) {
    const k = nextCounted(tokens, 0);
    const first = tokens[k];
    if (!isWord(first) || !isCapitalized(first) || first.text !== first.text[0] + first.lower.slice(1))
        return null;
    if (!lexicon.verbs.has(first.lower) || showsNoun(tokens, k, lexicon))
        return null;
    return k;
}
/**
 * The rule examines the first sentence of the summary of each doc comment. It finds a summary that starts
 * with a verb in the imperative, for example "Subscribe to an event.". The summary tells what the code
 * does, so it starts with its subject. Later sentences and `@remarks` can give instructions to the reader.
 * The rule is off by default: a project turns it on with `"rules": { "doc-subject": "error" }`.
 */
export const docSubject = {
    id: "doc-subject",
    description: "Find doc comment summaries that start with a verb in the imperative, for example \"Subscribe to an event.\". This rule is off by default.",
    ste: "4.2",
    defaultSeverity: "error",
    enabledByDefault: false,
    scope: "sentence",
    check(unit, context) {
        if (unit.origin.source !== "tsdoc" || unit.origin.tsdocLead !== true || unit.list !== null)
            return;
        const sentence = unit.sentences.find((candidate) => candidate.tokens.some(isCounted));
        if (sentence === undefined)
            return;
        const index = imperativeStart(sentence.tokens, context.lexicon);
        if (index === null)
            return;
        const word = sentence.tokens[index].text;
        context.report({
            ...tokenRange(sentence.tokens, index, index + 1),
            message: `The summary of this doc comment starts with the verb "${word}" and has no subject. Write the subject first, for example "This function ${thirdPerson(word.toLowerCase())} ...".`,
        });
    },
};
//# sourceMappingURL=doc-subject.js.map