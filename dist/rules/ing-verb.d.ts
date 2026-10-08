import type { PhraseMatcher } from "../text/phrases.js";
import { type Token } from "../text/tokens.js";
import { type Rule } from "./rule.js";
/** The token indices that a multi-word glossary phrase covers. */
export declare function coveredByPhrases(tokens: readonly Token[], phrases: PhraseMatcher): Set<number>;
/** The base form of an -ing word when it is a known verb ("running" gives "run"), or null. */
export declare function baseForm(word: string, verbs: ReadonlySet<string>): string | null;
export declare const ingVerb: Rule;
//# sourceMappingURL=ing-verb.d.ts.map