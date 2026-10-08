/** A line of source text, and the file offset of its first character. */
export type Line = {
    readonly text: string;
    readonly offset: number;
};
/**
 * This function divides `text` into lines. The offset of each line starts at
 * `base`. A `\r` before a `\n` is not part of the line text.
 */
export declare function splitLines(text: string, base?: number): Line[];
/** A 1-based line and column. */
export type Position = {
    readonly line: number;
    readonly column: number;
};
/** This index changes file offsets into 1-based line and column numbers. */
export declare class LineIndex {
    private readonly starts;
    constructor(text: string);
    /** The line and column of `offset`. */
    position(offset: number): Position;
}
/** The number of columns of indentation at the start of `text`. A tab moves to the next multiple of 4. */
export declare function indentWidth(text: string): number;
/** The part of `line` after the first `count` characters. The offset moves with the text. */
export declare function sliceLine(line: Line, count: number): Line;
/**
 * The part of `line` after `columns` columns of indentation. The function
 * removes fewer characters when the line has less indentation.
 */
export declare function stripIndent(line: Line, columns: number): Line;
/** True when the line has only white space. */
export declare function isBlank(text: string): boolean;
//# sourceMappingURL=lines.d.ts.map