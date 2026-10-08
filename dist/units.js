/**
 * Prose units: the blocks of text that the rules examine, with their tokens
 * and sentences.
 */
import { normalizeInline } from "./source/inline.js";
import { isInstruction } from "./text/grammar.js";
import { countWords, splitSentences } from "./text/sentences.js";
import { isCounted, tokenize } from "./text/tokens.js";
/** This function makes a prose unit from a block. The result is null when the block has no words. */
export function buildUnit(extracted, lexicon) {
    const { block, origin } = extracted;
    const inline = normalizeInline(block.lines, { mdx: origin.source === "mdx" || origin.source === "jsx", tsdoc: origin.source === "tsdoc" });
    return unitFromTokens(tokenize(inline), block, origin, lexicon);
}
/** This function makes a prose unit from the tokens of a block. */
export function unitFromTokens(tokens, block, origin, lexicon) {
    if (!tokens.some(isCounted))
        return null;
    const ranges = block.kind === "paragraph" ? splitSentences(tokens) : [{ from: 0, to: tokens.length }];
    const sentences = ranges.map((range) => {
        const sentenceTokens = tokens.slice(range.from, range.to);
        const count = countWords(sentenceTokens, { properNouns: lexicon.properNounPhrases });
        return {
            tokens: sentenceTokens,
            words: count.words,
            parentheticals: count.parentheticals,
            instruction: block.kind === "paragraph" && isInstruction(sentenceTokens, { verbs: lexicon.verbs }),
            start: sentenceTokens[0].start,
            end: sentenceTokens[sentenceTokens.length - 1].end,
        };
    });
    return {
        kind: block.kind,
        origin,
        list: block.list,
        tokens,
        sentences,
        start: tokens[0].start,
        end: tokens[tokens.length - 1].end,
    };
}
//# sourceMappingURL=units.js.map