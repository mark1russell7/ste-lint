import { aboutQuantity } from "./about-quantity.js";
import { ingVerb } from "./ing-verb.js";
import { latinAbbreviation } from "./latin-abbreviation.js";
import { missingSubjectRule } from "./missing-subject.js";
import { modalVerb } from "./modal-verb.js";
import { nounCluster } from "./noun-cluster.js";
import { paragraphLength } from "./paragraph-length.js";
import { passiveInstruction } from "./passive-instruction.js";
import { firstPerson, genderedPronoun } from "./pronouns.js";
import { semicolon } from "./semicolon.js";
import { sentenceLength } from "./sentence-length.js";
import { unknownWord } from "./unknown-word.js";
import { wordList } from "./word-list.js";
/** All rules, in the order of the documentation. */
export const RULES = [
    sentenceLength,
    paragraphLength,
    modalVerb,
    semicolon,
    latinAbbreviation,
    aboutQuantity,
    wordList,
    genderedPronoun,
    firstPerson,
    passiveInstruction,
    nounCluster,
    missingSubjectRule,
    ingVerb,
    unknownWord,
];
/** The rule with the ID `id`. */
export function getRule(id) {
    return RULES.find((rule) => rule.id === id);
}
//# sourceMappingURL=index.js.map