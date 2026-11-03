/**
 * The prose of a TypeScript or JavaScript file: the doc comments, and the
 * text that the JSX of a TSX or JSX file shows. This module needs the
 * `typescript` package, but no file system. A browser can use it.
 */
import { extractJsxText } from "./jsx.js";
import { extractTsdoc } from "./tsdoc.js";
/** This function extracts the prose of the source text of a TypeScript or JavaScript file. `path` gives the kind of file. */
export function extractCode(text, path) {
    const comments = extractTsdoc(text, path);
    if (!/\.[jt]sx$/i.test(path))
        return comments;
    // The text that the user interface shows
    return { blocks: [...comments.blocks, ...extractJsxText(text, path).blocks], suppressions: comments.suppressions };
}
//# sourceMappingURL=code.js.map