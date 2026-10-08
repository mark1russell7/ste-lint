/**
 * Inline normalization. This step changes the text of a block into "clean"
 * text that the tokenizer can read:
 *
 * - Each code span, `{@link ...}` tag, URL, MDX expression and quoted text
 *   becomes one placeholder character. STE Rule 8.6 counts quoted text and
 *   text in a different font as one word. The word rules do not examine the
 *   text in a placeholder.
 * - Link text stays. Link destinations, images, footnote references, HTML
 *   tags, JSX tags and emphasis markers go away.
 * - HTML entities become the characters that they show.
 *
 * Each character of the clean text keeps the file offset of its source
 * character, so findings point to the correct line and column.
 */
import type { Line } from "./lines.js";
/** The character that holds the place of a code span, link tag, URL or quoted text. */
export declare const PLACEHOLDER = "\uE000";
export type PlaceholderKind = "code" | "link" | "url" | "quote" | "expr";
export type Placeholder = {
    readonly kind: PlaceholderKind;
    /** The text in the placeholder, without its delimiters. */
    readonly text: string;
    /** The file offset of the first character. */
    readonly start: number;
    /** The file offset after the last character. */
    readonly end: number;
};
export type InlineText = {
    readonly clean: string;
    /** The file offset of each character of `clean`. */
    readonly offsets: readonly number[];
    /** The placeholders, by their index in `clean`. */
    readonly placeholders: ReadonlyMap<number, Placeholder>;
};
export type InlineOptions = {
    readonly mdx: boolean;
    readonly tsdoc: boolean;
};
/** This function normalizes the inline content of a block. Refer to the module comment. */
export declare function normalizeInline(lines: readonly Line[], options: InlineOptions): InlineText;
//# sourceMappingURL=inline.d.ts.map