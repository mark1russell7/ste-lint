/**
 * Prose extraction from Markdown and MDX files.
 */
import type { ExtractedBlock } from "../units.js";
import { type ProseBlock } from "./blocks.js";
import { type Line } from "./lines.js";
import { type Suppression } from "./suppressions.js";
export type Extraction = {
    readonly blocks: readonly ExtractedBlock[];
    readonly suppressions: readonly Suppression[];
};
/** This function removes YAML (`---`) or TOML (`+++`) front matter at the start of the file. */
export declare function stripFrontMatter(lines: readonly Line[]): readonly Line[];
/** The file offsets of the first and the last character of a block. */
export declare function blockRange(block: ProseBlock): {
    start: number;
    end: number;
};
/** This function extracts the prose blocks and the suppressions of a Markdown or MDX file. */
export declare function extractMarkdown(text: string, options: {
    readonly mdx: boolean;
}): Extraction;
//# sourceMappingURL=markdown.d.ts.map