/** The surface text of `tokens[from]` to `tokens[to - 1]`, with one space between tokens that had space between them. */
export function surface(tokens, from, to) {
    let text = "";
    for (let i = from; i < to; i++) {
        const token = tokens[i];
        const value = token.kind === "code" && token.placeholder !== null ? placeholderText(token) : token.text;
        text += (i > from && token.spaceBefore ? " " : "") + value;
    }
    return text;
}
function placeholderText(token) {
    const placeholder = token.placeholder;
    switch (placeholder.kind) {
        case "code": return `\`${placeholder.text}\``;
        case "quote": return `"${placeholder.text}"`;
        case "link": return `{${placeholder.text}}`;
        default: return placeholder.text;
    }
}
/** A report for the tokens `from` to `to - 1` of a sentence. */
export function tokenRange(tokens, from, to) {
    return { start: tokens[from].start, end: tokens[to - 1].end };
}
/** This function gives each token of each sentence of the unit to `visit`. */
export function forEachToken(unit, visit) {
    for (const sentence of unit.sentences) {
        for (let i = 0; i < sentence.tokens.length; i++)
            visit(sentence.tokens, i, sentence);
    }
}
//# sourceMappingURL=rule.js.map