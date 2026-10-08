import { type Finding, type RuleId } from "./types.js";
export type RuleCount = {
    readonly errors: number;
    readonly warnings: number;
};
export type Summary = {
    /** The number of files that the linter examined. */
    readonly files: number;
    readonly filesWithFindings: number;
    readonly errors: number;
    readonly warnings: number;
    /** The counts of each rule that has findings, in the order of the rule list. */
    readonly byRule: Readonly<Partial<Record<RuleId, RuleCount>>>;
};
/** This function counts the findings, by severity and by rule. */
export declare function summarize(findings: readonly Finding[], files: number): Summary;
/** The findings as text: one group for each file, then a summary and the counts by rule. */
export declare function formatText(findings: readonly Finding[], summary: Summary): string;
/** The findings and the summary as JSON. */
export declare function formatJson(findings: readonly Finding[], summary: Summary): string;
//# sourceMappingURL=format.d.ts.map