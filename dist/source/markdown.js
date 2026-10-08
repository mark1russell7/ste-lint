/**
 * Prose extraction from Markdown and MDX files.
 */
import { parseBlocks } from "./blocks.js";
import { splitLines } from "./lines.js";
import { SuppressionCollector } from "./suppressions.js";
/** This function removes YAML (`---`) or TOML (`+++`) front matter at the start of the file. */
export function stripFrontMatter(lines) {
    const first = lines[0]?.text.trimEnd();
    if (first !== "---" && first !== "+++")
        return lines;
    for (let i = 1; i < lines.length; i++) {
        const text = lines[i].text.trimEnd();
        if (text === first || (first === "---" && text === "..."))
            return lines.slice(i + 1);
    }
    return lines;
}
/** The file offsets of the first and the last character of a block. */
export function blockRange(block) {
    const first = block.lines[0];
    const last = block.lines[block.lines.length - 1];
    return { start: first.offset, end: last.offset + last.text.length };
}
/** This function extracts the prose blocks and the suppressions of a Markdown or MDX file. */
export function extractMarkdown(text, options) {
    const lines = stripFrontMatter(splitLines(text));
    const collector = new SuppressionCollector();
    const blocks = [];
    const origin = { source: options.mdx ? "mdx" : "markdown", tsdocSection: null, tsdocTag: null };
    for (const block of parseBlocks(lines, options)) {
        if (block.kind === "directive") {
            collector.directive(block);
            continue;
        }
        const range = blockRange(block);
        collector.block(range.start, range.end);
        blocks.push({ block, origin });
    }
    return { blocks, suppressions: collector.finish(text.length) };
}
//# sourceMappingURL=markdown.js.map