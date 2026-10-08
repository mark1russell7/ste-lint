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
import { indentWidth, isBlank, sliceLine, stripIndent } from "./lines.js";
/** HTML tags that start an HTML block (CommonMark type 6). */
const BLOCK_TAGS = new Set([
    "address", "article", "aside", "base", "basefont", "blockquote", "body", "caption", "center", "col",
    "colgroup", "dd", "details", "dialog", "dir", "div", "dl", "dt", "fieldset", "figcaption", "figure",
    "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr",
    "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem", "nav", "noframes", "ol",
    "optgroup", "option", "p", "param", "search", "section", "summary", "table", "tbody", "td",
    "tfoot", "th", "thead", "title", "tr", "track", "ul",
]);
/** HTML tags whose block stops at the closing tag, not at a blank line (CommonMark type 1). */
const RAW_TAGS = new Set(["script", "pre", "style", "textarea"]);
const DIRECTIVE = /^ste-(disable-next|disable|enable)\b(.*)$/s;
/** This function parses `lines` into prose blocks and directive comments. */
export function parseBlocks(lines, options) {
    const out = [];
    parseInto(lines, options, { list: null, quote: false }, out);
    return out;
}
/** The directive in the text of a comment, or null. */
export function parseDirective(commentText, offset) {
    const match = DIRECTIVE.exec(commentText.trim());
    if (!match)
        return null;
    const rest = match[2].split(" -- ")[0];
    const rules = rest.split(/[\s,]+/).filter((rule) => rule.length > 0);
    return { kind: "directive", command: match[1], rules, offset };
}
function proseBlock(kind, lines, context, headingDepth = 0, tableHeader = false) {
    return { kind, lines, list: context.list, quote: context.quote, headingDepth, tableHeader };
}
function parseInto(lines, options, context, out) {
    let paragraph = [];
    const flush = () => {
        if (paragraph.length > 0)
            out.push(proseBlock("paragraph", paragraph, context));
        paragraph = [];
    };
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (isBlank(line.text)) {
            flush();
            i++;
            continue;
        }
        const indent = indentWidth(line.text);
        const inParagraph = paragraph.length > 0;
        if (!inParagraph && indent >= 4) {
            i = skipIndentedCode(lines, i);
            continue;
        }
        const body = stripIndent(line, 3);
        const text = body.text;
        const fence = fenceOpening(text);
        if (fence !== null) {
            flush();
            i = skipFence(lines, i, fence);
            continue;
        }
        const atx = /^(#{1,6})(?:[ \t]+|$)/.exec(text);
        if (atx) {
            flush();
            out.push(proseBlock("heading", [headingContent(body, atx[0].length)], context, atx[1].length));
            i++;
            continue;
        }
        if (inParagraph && /^(?:=+|-+)[ \t]*$/.test(text)) {
            out.push(proseBlock("heading", paragraph, context, text.startsWith("=") ? 1 : 2));
            paragraph = [];
            i++;
            continue;
        }
        if (isThematicBreak(text)) {
            flush();
            i++;
            continue;
        }
        if (text.startsWith(">")) {
            flush();
            i = parseQuote(lines, i, options, context, out);
            continue;
        }
        const marker = listMarker(text);
        if (marker !== null && (!inParagraph || canInterruptParagraph(marker))) {
            flush();
            i = parseListItem(lines, i, options, context, out);
            continue;
        }
        if (text.startsWith("<!--")) {
            flush();
            i = parseHtmlComment(lines, i, out);
            continue;
        }
        if (text.startsWith("<")) {
            const next = parseTagLine(lines, i, body, inParagraph, options);
            if (next !== null) {
                flush();
                if (next.rest !== null)
                    paragraph.push(next.rest);
                i = next.index;
                continue;
            }
        }
        if (options.mdx && !inParagraph && /^(?:import|export)\b/.test(text)) {
            i = skipUntilBlank(lines, i);
            continue;
        }
        if (options.mdx && text.startsWith("{")) {
            flush();
            i = parseExpressionBlock(lines, i, body, out);
            continue;
        }
        if (text.startsWith(":::")) {
            flush();
            i++;
            continue;
        }
        if (!inParagraph && /^\[[^\]]+\]:/.test(text)) {
            i++;
            continue;
        }
        if (text.includes("|") && i + 1 < lines.length && isDelimiterRow(lines[i + 1].text)) {
            flush();
            i = parseTable(lines, i, context, out);
            continue;
        }
        paragraph.push(sliceLine(body, body.text.length - body.text.trimStart().length));
        i++;
    }
    flush();
}
function fenceOpening(text) {
    const match = /^(`{3,}|~{3,})(.*)$/.exec(text);
    if (!match)
        return null;
    const run = match[1];
    // A backtick fence cannot have a backtick in its info string.
    if (run[0] === "`" && match[2].includes("`"))
        return null;
    return { char: run[0], length: run.length };
}
function skipFence(lines, start, fence) {
    for (let i = start + 1; i < lines.length; i++) {
        const text = stripIndent(lines[i], 3).text;
        const match = /^(`+|~+)[ \t]*$/.exec(text);
        if (match && match[1][0] === fence.char && match[1].length >= fence.length)
            return i + 1;
    }
    return lines.length;
}
function skipIndentedCode(lines, start) {
    let i = start;
    while (i < lines.length && (isBlank(lines[i].text) || indentWidth(lines[i].text) >= 4))
        i++;
    return i;
}
function skipUntilBlank(lines, start) {
    let i = start;
    while (i < lines.length && !isBlank(lines[i].text))
        i++;
    return i;
}
function headingContent(body, markerLength) {
    const content = sliceLine(body, markerLength);
    const closing = /(?:^|[ \t]+)#+[ \t]*$/.exec(content.text);
    const text = closing ? content.text.slice(0, closing.index) : content.text;
    return { text: text.trimEnd(), offset: content.offset };
}
function isThematicBreak(text) {
    return /^(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/.test(text);
}
function listMarker(text) {
    const match = /^(?:([-*+])|(\d{1,9})[.)])([ \t]+|$)/.exec(text);
    if (!match)
        return null;
    const ordered = match[2] !== undefined;
    const length = ordered ? match[2].length + 1 : 1;
    const empty = text.slice(length).trim().length === 0;
    return { ordered, start: ordered ? Number(match[2]) : 0, length, spaces: match[3].length, empty };
}
/** A list can interrupt a paragraph only when it is not empty and an ordered list starts at 1 (CommonMark). */
function canInterruptParagraph(marker) {
    return !marker.empty && (!marker.ordered || marker.start === 1);
}
/** True when `text` starts a block that stops a lazy continuation line. */
function startsBlock(text) {
    return fenceOpening(text) !== null
        || /^#{1,6}(?:[ \t]|$)/.test(text)
        || text.startsWith(">")
        || isThematicBreak(text)
        || listMarker(text) !== null
        || /^<(?:!--|\/?[A-Za-z])/.test(text);
}
function parseQuote(lines, start, options, context, out) {
    const quoted = [];
    let i = start;
    while (i < lines.length) {
        const line = lines[i];
        const body = stripIndent(line, 3);
        if (body.text.startsWith(">")) {
            let inner = sliceLine(body, 1);
            if (inner.text.startsWith(" "))
                inner = sliceLine(inner, 1);
            quoted.push(inner);
            i++;
            continue;
        }
        const previous = quoted[quoted.length - 1];
        if (!isBlank(line.text) && previous !== undefined && !isBlank(previous.text) && !startsBlock(body.text)) {
            quoted.push(body);
            i++;
            continue;
        }
        break;
    }
    // A GitHub alert marker, for example `[!NOTE]`, is not prose.
    const first = quoted[0];
    if (first !== undefined && /^\[![A-Za-z]+\]\s*$/.test(first.text))
        quoted.shift();
    parseInto(quoted, options, { list: context.list, quote: true }, out);
    return i;
}
function parseListItem(lines, start, options, context, out) {
    const first = lines[start];
    const markerIndent = indentWidth(first.text);
    const atMarker = stripIndent(first, markerIndent);
    const marker = listMarker(atMarker.text);
    const spaces = marker.empty || marker.spaces > 4 ? 1 : marker.spaces;
    const contentColumn = markerIndent + marker.length + spaces;
    const itemLines = [sliceLine(atMarker, marker.length + Math.min(marker.spaces, spaces))];
    let i = start + 1;
    let previousBlank = marker.empty;
    while (i < lines.length) {
        const line = lines[i];
        if (isBlank(line.text)) {
            itemLines.push(line);
            previousBlank = true;
            i++;
            continue;
        }
        const indent = indentWidth(line.text);
        if (indent >= contentColumn) {
            itemLines.push(stripIndent(line, contentColumn));
            previousBlank = false;
            i++;
            continue;
        }
        if (!previousBlank && !startsBlock(stripIndent(line, 3).text) && !(i + 1 < lines.length && isDelimiterRow(lines[i + 1].text))) {
            itemLines.push(stripIndent(line, indent));
            i++;
            continue;
        }
        break;
    }
    parseInto(itemLines, options, { list: { ordered: marker.ordered }, quote: context.quote }, out);
    return i;
}
function parseHtmlComment(lines, start, out) {
    const first = stripIndent(lines[start], 3);
    let text = first.text.slice(4);
    let i = start;
    while (!text.includes("-->") && i + 1 < lines.length) {
        i++;
        text += "\n" + lines[i].text;
    }
    const directive = parseDirective(text.split("-->")[0], first.offset);
    if (directive !== null)
        out.push(directive);
    return i + 1;
}
/**
 * This function handles a line that starts with `<`. The result is null when
 * the line is prose with inline HTML.
 */
function parseTagLine(lines, start, body, inParagraph, options) {
    const text = body.text;
    const tag = /^<(\/?)([A-Za-z][A-Za-z0-9.:_-]*)(?=[\s/>]|$)/.exec(text);
    const fragment = /^<\/?>/.test(text);
    if (tag === null && !fragment)
        return null;
    if (options.mdx) {
        const end = findTagEnd(lines, start, body.offset - lines[start].offset);
        const endLine = lines[end.line];
        const rest = sliceLine(endLine, end.column);
        // A line with only a tag is a JSX block, also after paragraph text. A tag with text after it in a paragraph is inline JSX.
        if (isBlank(rest.text) || rest.text.trimStart().startsWith("<"))
            return { index: end.line + 1, rest: null };
        if (inParagraph)
            return null;
        return { index: end.line + 1, rest: sliceLine(rest, rest.text.length - rest.text.trimStart().length) };
    }
    const name = tag === null ? "" : tag[2].toLowerCase();
    if (tag !== null && tag[1] === "" && RAW_TAGS.has(name)) {
        let i = start;
        while (i < lines.length && !lines[i].text.toLowerCase().includes(`</${name}>`))
            i++;
        return { index: Math.min(i + 1, lines.length), rest: null };
    }
    if (BLOCK_TAGS.has(name))
        return { index: skipUntilBlank(lines, start), rest: null };
    // CommonMark type 7: a line with only a complete tag, which cannot interrupt a paragraph.
    if (!inParagraph && /^<\/?[A-Za-z][^<>]*>\s*$/.test(text))
        return { index: skipUntilBlank(lines, start), rest: null };
    return null;
}
/** This function finds the `>` that closes a JSX tag. JSX can continue on the lines after the tag start. */
function findTagEnd(lines, startLine, startColumn) {
    let quote = null;
    let depth = 0;
    for (let l = startLine; l < lines.length; l++) {
        const text = lines[l].text;
        for (let c = l === startLine ? startColumn + 1 : 0; c < text.length; c++) {
            const char = text[c];
            if (quote !== null) {
                if (char === quote)
                    quote = null;
            }
            else if (char === "\"" || char === "'" || char === "`") {
                quote = char;
            }
            else if (char === "{") {
                depth++;
            }
            else if (char === "}") {
                depth = Math.max(0, depth - 1);
            }
            else if (char === ">" && depth === 0) {
                return { line: l, column: c + 1 };
            }
        }
    }
    return { line: lines.length - 1, column: lines[lines.length - 1].text.length };
}
/** This function skips an MDX `{...}` expression, and keeps a directive comment in it. */
function parseExpressionBlock(lines, start, body, out) {
    let depth = 0;
    let quote = null;
    let collected = "";
    for (let l = start; l < lines.length; l++) {
        const text = l === start ? body.text : lines[l].text;
        for (let c = 0; c < text.length; c++) {
            const char = text[c];
            collected += char;
            if (quote !== null) {
                if (char === quote)
                    quote = null;
            }
            else if (char === "\"" || char === "'" || char === "`") {
                quote = char;
            }
            else if (char === "{") {
                depth++;
            }
            else if (char === "}") {
                depth--;
                if (depth === 0) {
                    const comment = /^\{\s*\/\*([\s\S]*)\*\/\s*\}$/.exec(collected);
                    if (comment) {
                        const directive = parseDirective(comment[1], body.offset);
                        if (directive !== null)
                            out.push(directive);
                    }
                    return l + 1;
                }
            }
        }
        collected += "\n";
    }
    return lines.length;
}
/** True for a GFM table delimiter row, for example `| --- | :-: |`. */
export function isDelimiterRow(text) {
    return text.includes("|") && /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/.test(text);
}
/** This function divides a table row into cells. A `|` in a code span or after `\` does not divide cells. */
export function splitCells(row) {
    const text = row.text;
    const cells = [];
    let cellStart = 0;
    let i = 0;
    const pushCell = (end) => {
        const raw = text.slice(cellStart, end);
        const lead = raw.length - raw.trimStart().length;
        cells.push({ text: raw.trim(), offset: row.offset + cellStart + lead });
    };
    while (i < text.length) {
        const char = text[i];
        if (char === "\\") {
            i += 2;
            continue;
        }
        if (char === "`") {
            let run = 1;
            while (text[i + run] === "`")
                run++;
            const close = findBacktickRun(text, i + run, run);
            i = close === -1 ? i + run : close + run;
            continue;
        }
        if (char === "|") {
            pushCell(i);
            cellStart = i + 1;
        }
        i++;
    }
    pushCell(text.length);
    // A leading or trailing pipe makes an empty cell at the edge. That cell is not part of the table.
    if (text.trimStart().startsWith("|"))
        cells.shift();
    if (text.trimEnd().endsWith("|") && !text.trimEnd().endsWith("\\|"))
        cells.pop();
    return cells;
}
/** The index of the next run of exactly `length` backticks at or after `from`, or -1. */
export function findBacktickRun(text, from, length) {
    let i = from;
    while (i < text.length) {
        if (text[i] === "`") {
            let run = 1;
            while (text[i + run] === "`")
                run++;
            if (run === length)
                return i;
            i += run;
        }
        else {
            i++;
        }
    }
    return -1;
}
function parseTable(lines, start, context, out) {
    const emitRow = (line, header) => {
        for (const cell of splitCells(stripIndent(line, 3))) {
            if (cell.text.length > 0)
                out.push(proseBlock("table-cell", [cell], context, 0, header));
        }
    };
    emitRow(lines[start], true);
    let i = start + 2;
    while (i < lines.length) {
        const line = lines[i];
        if (isBlank(line.text) || !line.text.includes("|") || startsBlock(stripIndent(line, 3).text))
            break;
        emitRow(line, false);
        i++;
    }
    return i;
}
//# sourceMappingURL=blocks.js.map