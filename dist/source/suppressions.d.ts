import type { Directive } from "./blocks.js";
/** A range of the file in which some rules (or all rules) do not report findings. */
export type Suppression = {
    readonly start: number;
    readonly end: number;
    /** The rule IDs, or null for all rules. */
    readonly rules: ReadonlySet<string> | null;
};
/**
 * This class collects suppressions from directive comments:
 *
 * - `ste-disable [rules]` starts a range. `ste-enable [rules]` stops it.
 *   Without an `ste-enable`, the range continues to the end of the file.
 * - `ste-disable-next [rules]` applies to the next block only: the next
 *   paragraph, heading, list item or table row in Markdown, or the next doc
 *   comment in TypeScript.
 *
 * Without rule IDs, a directive applies to all rules.
 */
export declare class SuppressionCollector {
    private readonly ranges;
    private readonly open;
    private pending;
    directive(directive: Directive): void;
    /**
     * A plain `ste-enable` stops all open ranges. An `ste-enable` with rule
     * IDs stops those rules only. A range for all rules stops only at a
     * plain `ste-enable`.
     */
    private enable;
    /** This method tells the collector about the next block, so that a pending `ste-disable-next` applies to it. */
    block(start: number, end: number): void;
    /** The suppressions. Open ranges stop at `fileEnd`. */
    finish(fileEnd: number): Suppression[];
}
/** True when a suppression covers a finding of `rule` at `offset`. */
export declare function isSuppressed(suppressions: readonly Suppression[], rule: string, offset: number): boolean;
//# sourceMappingURL=suppressions.d.ts.map