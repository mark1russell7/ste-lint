/**
 * The linter for files: the engine of `engine.ts`, with the extractor of
 * TypeScript doc comments and the file system.
 */
import { readFileSync } from "node:fs";
import { ProseLinter } from "./engine.js";
import { extractCode } from "./source/code.js";
export { fileKind } from "./engine.js";
/** A linter for one configuration. It makes the lexicon and the word list matcher one time. */
export class Linter extends ProseLinter {
    constructor(config, lexicon) {
        super(config, lexicon, { extractCode });
    }
    /** The findings in a file on disk. `displayPath` is the file name in the findings. */
    lintFile(path, displayPath = path) {
        return this.lintText(readFileSync(path, "utf8"), displayPath);
    }
}
/** The findings in `text`, with a new linter. To lint many files, make one `Linter` and use it again. */
export function lintText(text, path, config, lexicon) {
    return new Linter(config, lexicon).lintText(text, path);
}
//# sourceMappingURL=lint.js.map