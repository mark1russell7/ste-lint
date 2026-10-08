import { type InlineText, type Placeholder } from "../source/inline.js";
export type TokenKind = "word" | "code" | "punct";
export type Token = {
    readonly kind: TokenKind;
    /** The surface text. For a placeholder, the text in the code span, link tag or quote. */
    readonly text: string;
    /** The text in lower case, with typographic apostrophes changed to `'`. */
    readonly lower: string;
    /** The file offset of the first character. */
    readonly start: number;
    /** The file offset after the last character. */
    readonly end: number;
    /** True when white space comes before the token in the clean text. */
    readonly spaceBefore: boolean;
    readonly placeholder: Placeholder | null;
};
/** This function divides clean text into word, code and punctuation tokens. */
export declare function tokenize(inline: InlineText): Token[];
/** The lower-case form of a word, with typographic apostrophes changed to `'`. */
export declare function normalizeWord(text: string): string;
export declare function isWord(token: Token | undefined): token is Token;
/** True for a word or a placeholder. Both count in the STE word count. */
export declare function isCounted(token: Token | undefined): boolean;
export declare function isNumber(token: Token | undefined): boolean;
/** True for an abbreviation in capital letters, for example `API`, `CPUs` or `HTTP2`. */
export declare function isAbbreviation(token: Token | undefined): boolean;
/** True when the first character is a capital letter. */
export declare function isCapitalized(token: Token | undefined): boolean;
/**
 * True for a word that looks like code although it is not in code font.
 * Examples are a camelCase or snake_case name, a path with dots or slashes,
 * a flag, a word with digits, and a name with `()`.
 */
export declare function isIdentifierLike(token: Token | undefined): boolean;
//# sourceMappingURL=tokens.d.ts.map