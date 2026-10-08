/**
 * Prose extraction from the JSX of TSX and JSX files: the text that a user
 * interface shows.
 *
 * An element with text children is one block. Inline elements (`strong`,
 * `a`, `code` and the other elements in `INLINE_ELEMENTS`) and `{...}`
 * expressions stay in the text of their parent. A code element and an
 * expression become one placeholder, which counts as one word. An element
 * with other children gives one block for each run of its text between
 * those children. The JSX inside an expression gives its own blocks.
 *
 * The values of the attributes in `TEXT_ATTRIBUTES` (for example `title`
 * and `aria-label`) are blocks too, when they are string literals.
 */
import type { Extraction } from "./markdown.js";
/** This function extracts the text blocks of the JSX of a file. */
export declare function extractJsxText(text: string, fileName: string): Extraction;
//# sourceMappingURL=jsx.d.ts.map