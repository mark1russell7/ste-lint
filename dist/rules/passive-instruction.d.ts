import { type Rule } from "./rule.js";
/**
 * The rule examines these constructions:
 *
 * - An obligation in the passive voice ("must be set", "has to be called",
 *   "needs to be installed") in any sentence. This is an instruction in a
 *   passive form.
 * - Any passive ("is cleared", "are triggered by CI") in a procedural
 *   sentence: an imperative sentence or an item of an ordered list. A
 *   participle after "be" in a condition clause ("if the file is deleted",
 *   "make sure that the server is started") shows a state, so the rule
 *   ignores it.
 */
export declare const passiveInstruction: Rule;
//# sourceMappingURL=passive-instruction.d.ts.map