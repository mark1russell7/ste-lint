import type { Lexicon } from "../lexicon.js";
import { type Token } from "../text/tokens.js";
import { type Rule } from "./rule.js";
/** The form of a verb after "This function": "get" gives "gets", "process" gives "processes", "retry" gives "retries". */
export declare function thirdPerson(verb: string): string;
/** The index of the first word when the sentence at `tokens` starts with a verb in the imperative, or null. */
export declare function imperativeStart(tokens: readonly Token[], lexicon: Lexicon): number | null;
/**
 * The rule examines the first sentence of the summary of each doc comment. It finds a summary that starts
 * with a verb in the imperative, for example "Subscribe to an event.". The summary tells what the code
 * does, so it starts with its subject. Later sentences and `@remarks` can give instructions to the reader.
 * The rule is off by default: a project turns it on with `"rules": { "doc-subject": "error" }`.
 */
export declare const docSubject: Rule;
//# sourceMappingURL=doc-subject.d.ts.map