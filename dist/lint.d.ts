/**
 * The lint engine. It extracts the prose of a file, runs the rules on each
 * prose unit, and gives the findings with their lines and columns.
 */
import type { ResolvedConfig } from "./config.js";
import { type Lexicon } from "./lexicon.js";
import type { Finding } from "./types.js";
import { type ProseUnit } from "./units.js";
export type FileKind = "markdown" | "mdx" | "typescript";
/** The kind of a file, from its extension, or null when the linter cannot read it. */
export declare function fileKind(path: string): FileKind | null;
/** A linter for one configuration. It makes the lexicon and the word list matcher one time. */
export declare class Linter {
    readonly config: ResolvedConfig;
    readonly lexicon: Lexicon;
    private readonly wordList;
    private readonly rules;
    constructor(config: ResolvedConfig, lexicon?: Lexicon);
    /** The prose units of a file. */
    units(text: string, path: string): ProseUnit[];
    /** The findings in `text`. `path` gives the kind of file, and it is the file name in the findings. */
    lintText(text: string, path: string): Finding[];
    /** The findings in a file on disk. `displayPath` is the file name in the findings. */
    lintFile(path: string, displayPath?: string): Finding[];
}
/** The findings in `text`, with a new linter. To lint many files, make one `Linter` and use it again. */
export declare function lintText(text: string, path: string, config: ResolvedConfig, lexicon?: Lexicon): Finding[];
//# sourceMappingURL=lint.d.ts.map