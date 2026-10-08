export const RULE_IDS = [
    "sentence-length",
    "paragraph-length",
    "modal-verb",
    "semicolon",
    "latin-abbreviation",
    "about-quantity",
    "word-list",
    "gendered-pronoun",
    "first-person",
    "passive-instruction",
    "noun-cluster",
    "missing-subject",
    "ing-verb",
    "unknown-word",
];
export function isRuleId(value) {
    return RULE_IDS.includes(value);
}
//# sourceMappingURL=types.js.map