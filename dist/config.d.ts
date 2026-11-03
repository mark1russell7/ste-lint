/**
 * The configuration file `ste.config.json`, and the configuration that the
 * linter uses after it reads the file, the environment and the defaults.
 */
import { type ResolvedConfig, type SteConfigFile } from "./config-core.js";
export * from "./config-core.js";
/** This function expands a leading `~/` to the home directory, and makes the path absolute. */
export declare function resolvePath(path: string, base: string): string;
export type ResolveOptions = {
    /** The directory of the configuration file, or the working directory. */
    readonly root: string;
    readonly configFile?: string | null;
    /** The working directory. `STE_DICTIONARY` is relative to it. */
    readonly cwd?: string;
    readonly env?: Readonly<Record<string, string | undefined>>;
};
/** This function applies the defaults and the environment to a configuration file. */
export declare function resolveConfig(file: SteConfigFile, options: ResolveOptions): ResolvedConfig;
/** The first `ste.config.json` in `cwd` or one of its parent directories, or null. */
export declare function findConfigFile(cwd: string): string | null;
export type LoadOptions = {
    readonly cwd: string;
    /** An explicit configuration file. Without it, the linter looks for `ste.config.json`. */
    readonly configPath?: string;
    readonly env?: Readonly<Record<string, string | undefined>>;
};
/** This function reads the configuration file, if there is one, and resolves it. */
export declare function loadConfig(options: LoadOptions): ResolvedConfig;
//# sourceMappingURL=config.d.ts.map