/**
 * Prose extraction from the doc comments (`/** ... *\/`) of TypeScript and
 * JavaScript files.
 *
 * The TypeScript compiler parses the file. The extractor then examines only
 * the trivia between tokens. Thus, text in strings, template literals,
 * regular expressions and JSX does not become a comment.
 */
import type { TsdocSection } from "../units.js";
import { type Line } from "./lines.js";
import type { Extraction } from "./markdown.js";
export type CommentKind = "line" | "block" | "doc";
export type CommentRange = {
    readonly kind: CommentKind;
    /** The file offset of the first `/`. */
    readonly pos: number;
    /** The file offset after the comment. */
    readonly end: number;
};
/** This function finds all comments in a file. The comments come in file order. */
export declare function collectComments(text: string, fileName: string): CommentRange[];
/**
 * This function removes the comment syntax from the lines of a doc comment:
 *
 * - `/**` on the first line
 * - `*\/` on the last line
 * - The `*` and one space at the start of the other lines.
 */
export declare function docCommentLines(text: string, comment: CommentRange): Line[];
type Section = {
    readonly section: TsdocSection;
    readonly tag: string | null;
    readonly lines: Line[];
};
/** This function divides the lines of a doc comment into the summary and the block tag sections. */
export declare function splitSections(lines: readonly Line[]): Section[];
/** This function extracts the prose blocks of the doc comments of a file, and the suppressions. */
export declare function extractTsdoc(text: string, fileName: string): Extraction;
export {};
//# sourceMappingURL=tsdoc.d.ts.map