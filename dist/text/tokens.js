import { PLACEHOLDER } from "../source/inline.js";
import { NUMBER_WORDS } from "./words.js";
/**
 * One word: letters and digits, with hyphens, dots, slashes, underscores,
 * colons and apostrophes inside it. Thus `main-thread`, `I/O`, `e.g`,
 * `v1.2.3`, `snake_case`, `don't`, `1,000` and `packages/lag` are each one word. A
 * word can start with `--`, `-`, `@`, `#` or `$` (flags, scoped packages,
 * issue numbers, variables), and it can end with `()`.
 */
const WORD = /(?:--?|[@#$])?[\p{L}\p{N}][\p{L}\p{N}\p{M}]*(?:(?:['’](?=\p{L})|[-_./:+@#\\](?=[\p{L}\p{N}])|(?<=\p{N})–(?=\p{N})|(?<=\p{N}),(?=\p{N}{3}(?!\p{N})))[\p{L}\p{N}\p{M}]*)*(?:\(\))?/uy;
const CHAR = /./suy;
/** This function divides clean text into word, code and punctuation tokens. */
export function tokenize(inline) {
    const { clean, offsets, placeholders } = inline;
    const tokens = [];
    let i = 0;
    let space = true;
    while (i < clean.length) {
        const char = clean[i];
        if (/\s/.test(char)) {
            space = true;
            i++;
            continue;
        }
        if (char === PLACEHOLDER) {
            const placeholder = placeholders.get(i);
            if (placeholder !== undefined) {
                tokens.push({
                    kind: "code",
                    text: placeholder.text,
                    lower: normalizeWord(placeholder.text),
                    start: placeholder.start,
                    end: placeholder.end,
                    spaceBefore: space,
                    placeholder,
                });
                space = false;
                i++;
                continue;
            }
        }
        WORD.lastIndex = i;
        const word = WORD.exec(clean);
        let text;
        let kind;
        if (word !== null) {
            text = word[0];
            kind = "word";
        }
        else if (clean.startsWith("...", i)) {
            text = "...";
            kind = "punct";
        }
        else {
            CHAR.lastIndex = i;
            text = CHAR.exec(clean)[0];
            kind = "punct";
        }
        tokens.push({
            kind,
            text,
            lower: normalizeWord(text),
            start: offsets[i],
            end: offsets[i + text.length - 1] + 1,
            spaceBefore: space,
            placeholder: null,
        });
        space = false;
        i += text.length;
    }
    return tokens;
}
/** The lower-case form of a word, with typographic apostrophes changed to `'`. */
export function normalizeWord(text) {
    return text.toLowerCase().replace(/[’‘]/g, "'");
}
export function isWord(token) {
    return token !== undefined && token.kind === "word";
}
/** True for a word or a placeholder. Both count in the STE word count. */
export function isCounted(token) {
    return token !== undefined && token.kind !== "punct";
}
export function isNumber(token) {
    return isWord(token) && (/^[-+]?\d[\d,.–-]*%?$/.test(token.text) || NUMBER_WORDS.has(token.lower));
}
/** True for an abbreviation in capital letters, for example `API`, `CPUs` or `HTTP2`. */
export function isAbbreviation(token) {
    return isWord(token) && /^[A-Z][A-Z0-9]+s?$/.test(token.text) && /[A-Z].*[A-Z]|^[A-Z][0-9]/.test(token.text);
}
/** True when the first character is a capital letter. */
export function isCapitalized(token) {
    return isWord(token) && /^\p{Lu}/u.test(token.text);
}
/**
 * True for a word that looks like code although it is not in code font.
 * Examples are a camelCase or snake_case name, a path with dots or slashes,
 * a flag, a word with digits, and a name with `()`.
 */
export function isIdentifierLike(token) {
    if (!isWord(token))
        return false;
    const text = token.text;
    if (/^(?:e\.g|i\.e|u\.s|a\.m|p\.m)$/i.test(text))
        return false;
    return /\p{Ll}\p{Lu}/u.test(text)
        || /\p{Lu}{2,}\p{Ll}/u.test(text)
        || /[_./\\:@#$]/.test(text)
        || /^--?/.test(text)
        || text.endsWith("()")
        || (/\d/.test(text) && /\p{L}/u.test(text));
}
//# sourceMappingURL=tokens.js.map