/**
 * The linter for files: the engine of `engine.ts`, with the extractor of
 * TypeScript doc comments and the file system.
 */
import type { ResolvedConfig } from "./config.js";
import { ProseLinter } from "./engine.js";
import type { Lexicon } from "./lexicon.js";
import type { Finding } from "./types.js";
export { fileKind, type FileKind } from "./engine.js";
/** A linter for one configuration. It makes the lexicon and the word list matcher one time. */
export declare class Linter extends ProseLinter {
    constructor(config: ResolvedConfig, lexicon?: Lexicon);
    /** The findings in a file on disk. `displayPath` is the file name in the findings. */
    lintFile(path: string, displayPath?: string): Finding[];
}
/** The findings in `text`, with a new linter. To lint many files, make one `Linter` and use it again. */
export declare function lintText(text: string, path: string, config: ResolvedConfig, lexicon?: Lexicon): Finding[];
//# sourceMappingURL=lint.d.ts.map