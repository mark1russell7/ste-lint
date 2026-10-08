/**
 * A block parser for the part of Markdown, GFM and MDX that has prose in it.
 *
 * The parser keeps paragraphs, headings, list items, block quotes and table
 * cells. It removes fenced and indented code, HTML blocks, JSX tags, MDX
 * import and export lines, MDX expressions, link reference definitions and
 * thematic breaks. The TSDoc extractor uses the same parser for the text in
 * a doc comment.
 *
 * The parser does not build a full CommonMark tree. It knows only the
 * structure that the lint rules use. That is where a block starts and
 * stops, and if the block is a heading, a table cell or text in a list item.
 */
import { type Line } from "./lines.js";
export type ListContext = {
    readonly ordered: boolean;
};
/** A block of prose that the lint rules examine. */
export type ProseBlock = {
    readonly kind: "paragraph" | "heading" | "table-cell";
    /** The text lines of the block, without Markdown block syntax. */
    readonly lines: readonly Line[];
    /** The innermost list that contains the block, or null. */
    readonly list: ListContext | null;
    readonly quote: boolean;
    /** 1 to 6 for a heading, 0 for other blocks. */
    readonly headingDepth: number;
    /** True for the cells of a table header row. */
    readonly tableHeader: boolean;
};
export type DirectiveCommand = "disable" | "enable" | "disable-next";
/** A `ste-disable`, `ste-enable` or `ste-disable-next` comment. */
export type Directive = {
    readonly kind: "directive";
    readonly command: DirectiveCommand;
    /** The rule IDs. An empty list means all rules. */
    readonly rules: readonly string[];
    readonly offset: number;
};
export type Block = ProseBlock | Directive;
export type BlockOptions = {
    /** Parse JSX tags, ESM lines and `{...}` expressions as MDX does. */
    readonly mdx: boolean;
};
/** This function parses `lines` into prose blocks and directive comments. */
export declare function parseBlocks(lines: readonly Line[], options: BlockOptions): Block[];
/** The directive in the text of a comment, or null. */
export declare function parseDirective(commentText: string, offset: number): Directive | null;
/** True for a GFM table delimiter row, for example `| --- | :-: |`. */
export declare function isDelimiterRow(text: string): boolean;
/** This function divides a table row into cells. A `|` in a code span or after `\` does not divide cells. */
export declare function splitCells(row: Line): Line[];
/** The index of the next run of exactly `length` backticks at or after `from`, or -1. */
export declare function findBacktickRun(text: string, from: number, length: number): number;
//# sourceMappingURL=blocks.d.ts.map