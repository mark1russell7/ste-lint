/**
 * The lint engine without a file system. It extracts the prose of a text,
 * runs the rules on each prose unit, and gives the findings with their lines
 * and columns. A browser can use this module.
 */
import type { ResolvedConfig } from "./config-core.js";
import { type Lexicon } from "./lexicon.js";
import { type Extraction } from "./source/markdown.js";
import type { Finding } from "./types.js";
import { type ProseUnit } from "./units.js";
export type FileKind = "markdown" | "mdx" | "typescript";
/** The kind of a file, from its extension, or null when the linter cannot read it. */
export declare function fileKind(path: string): FileKind | null;
/**
 * A function that extracts the prose of a TypeScript or JavaScript file:
 * the doc comments, and the JSX text of a TSX or JSX file.
 */
export type CodeExtractor = (text: string, path: string) => Extraction;
export type ProseLinterOptions = {
    /**
     * The extractor for TypeScript and JavaScript files. Without it, the
     * linter gives no findings for these files. The extractor of this
     * package (`extractCode`) needs the `typescript` package.
     */
    readonly extractCode?: CodeExtractor;
};
/**
 * A linter for one configuration, for text in memory. It makes the lexicon
 * and the word list matcher one time. It reads no file.
 */
export declare class ProseLinter {
    readonly lexicon: Lexicon;
    private readonly wordList;
    private readonly rules;
    private readonly extractCode;
    readonly config: ResolvedConfig;
    constructor(config: ResolvedConfig, lexicon?: Lexicon, options?: ProseLinterOptions);
    /** The prose units of a file. */
    units(text: string, path: string): ProseUnit[];
    /** The findings in `text`. `path` gives the kind of file, and it is the file name in the findings. */
    lintText(text: string, path: string): Finding[];
    private extract;
}
//# sourceMappingURL=engine.d.ts.map