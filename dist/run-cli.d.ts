/**
 * The command-line interface. `runCli` does not use `process` directly, so
 * the tests can give it arguments, an environment and output functions.
 */
export type CliIo = {
    readonly cwd: string;
    readonly env: Readonly<Record<string, string | undefined>>;
    readonly stdout: (text: string) => void;
    readonly stderr: (text: string) => void;
};
export type CliOptions = {
    readonly patterns: readonly string[];
    readonly format: "text" | "json";
    readonly maxWarnings: number | null;
    readonly configPath: string | null;
    readonly help: boolean;
};
/** An incorrect command line. */
export declare class UsageError extends Error {
    readonly name: string;
}
export declare const USAGE: string;
/** This function reads the command-line arguments. */
export declare function parseArgs(argv: readonly string[]): CliOptions;
/** This function starts the linter with command-line arguments. The result is the exit code. */
export declare function runCli(argv: readonly string[], io: CliIo): number;
//# sourceMappingURL=run-cli.d.ts.map