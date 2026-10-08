import type { RuleId } from "../types.js";
import type { Rule } from "./rule.js";
/** All rules, in the order of the documentation. */
export declare const RULES: readonly Rule[];
/** The rule with the ID `id`. */
export declare function getRule(id: RuleId): Rule;
export type { Report, Rule, RuleContext, RuleScope } from "./rule.js";
//# sourceMappingURL=index.d.ts.map