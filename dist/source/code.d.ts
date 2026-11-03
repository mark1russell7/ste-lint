/**
 * The prose of a TypeScript or JavaScript file: the doc comments, and the
 * text that the JSX of a TSX or JSX file shows. This module needs the
 * `typescript` package, but no file system. A browser can use it.
 */
import type { Extraction } from "./markdown.js";
/** This function extracts the prose of the source text of a TypeScript or JavaScript file. `path` gives the kind of file. */
export declare function extractCode(text: string, path: string): Extraction;
//# sourceMappingURL=code.d.ts.map