/**
 * This function divides `text` into lines. The offset of each line starts at
 * `base`. A `\r` before a `\n` is not part of the line text.
 */
export function splitLines(text, base = 0) {
    const lines = [];
    let start = 0;
    for (let i = 0; i <= text.length; i++) {
        if (i === text.length || text[i] === "\n") {
            let end = i;
            if (end > start && text[end - 1] === "\r")
                end--;
            lines.push({ text: text.slice(start, end), offset: base + start });
            start = i + 1;
        }
    }
    return lines;
}
/** This index changes file offsets into 1-based line and column numbers. */
export class LineIndex {
    starts = [0];
    constructor(text) {
        for (let i = 0; i < text.length; i++) {
            if (text[i] === "\n")
                this.starts.push(i + 1);
        }
    }
    /** The line and column of `offset`. */
    position(offset) {
        let low = 0;
        let high = this.starts.length - 1;
        while (low < high) {
            const middle = (low + high + 1) >> 1;
            if (this.starts[middle] <= offset)
                low = middle;
            else
                high = middle - 1;
        }
        return { line: low + 1, column: offset - this.starts[low] + 1 };
    }
}
/** The number of columns of indentation at the start of `text`. A tab moves to the next multiple of 4. */
export function indentWidth(text) {
    let width = 0;
    for (const char of text) {
        if (char === " ")
            width++;
        else if (char === "\t")
            width += 4 - (width % 4);
        else
            break;
    }
    return width;
}
/** The part of `line` after the first `count` characters. The offset moves with the text. */
export function sliceLine(line, count) {
    const n = Math.min(Math.max(count, 0), line.text.length);
    return { text: line.text.slice(n), offset: line.offset + n };
}
/**
 * The part of `line` after `columns` columns of indentation. The function
 * removes fewer characters when the line has less indentation.
 */
export function stripIndent(line, columns) {
    let width = 0;
    let i = 0;
    while (i < line.text.length && width < columns) {
        const char = line.text[i];
        if (char === " ")
            width++;
        else if (char === "\t")
            width += 4 - (width % 4);
        else
            break;
        i++;
    }
    return sliceLine(line, i);
}
/** True when the line has only white space. */
export function isBlank(text) {
    return text.trim().length === 0;
}
//# sourceMappingURL=lines.js.map