/**
 * Prose units: the blocks of text that the rules examine, with their tokens
 * and sentences.
 */
import type { Lexicon } from "./lexicon.js";
import type { ListContext, ProseBlock } from "./source/blocks.js";
import { type Token } from "./text/tokens.js";
export type TsdocSection = "summary" | "remarks" | "tag";
/** Where a block comes from. */
export type BlockOrigin = {
    readonly source: "markdown" | "mdx" | "tsdoc" | "jsx";
    /** For a doc comment: the summary, the `@remarks` section, or the text of another block tag. */
    readonly tsdocSection: TsdocSection | null;
    /** For a doc comment: the block tag, for example `@param`, or null for the summary. */
    readonly tsdocTag: string | null;
};
export type ExtractedBlock = {
    readonly block: ProseBlock;
    readonly origin: BlockOrigin;
};
export type Sentence = {
    /** All tokens of the sentence, with the punctuation. */
    readonly tokens: readonly Token[];
    /** The STE word count. */
    readonly words: number;
    /** The tokens in each top-level parenthesis. Each one counts as a separate sentence. */
    readonly parentheticals: readonly (readonly Token[])[];
    /** True when the sentence is an instruction (imperative). */
    readonly instruction: boolean;
    readonly start: number;
    readonly end: number;
};
export type UnitKind = ProseBlock["kind"];
export type ProseUnit = {
    readonly kind: UnitKind;
    readonly origin: BlockOrigin;
    readonly list: ListContext | null;
    readonly tokens: readonly Token[];
    readonly sentences: readonly Sentence[];
    readonly start: number;
    readonly end: number;
};
/** This function makes a prose unit from a block. The result is null when the block has no words. */
export declare function buildUnit(extracted: ExtractedBlock, lexicon: Lexicon): ProseUnit | null;
/** This function makes a prose unit from the tokens of a block. */
export declare function unitFromTokens(tokens: readonly Token[], block: Pick<ProseBlock, "kind" | "list">, origin: BlockOrigin, lexicon: Lexicon): ProseUnit | null;
//# sourceMappingURL=units.d.ts.map