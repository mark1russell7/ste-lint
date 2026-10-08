/**
 * The configuration file `ste.config.json`, and the configuration that the
 * linter uses after it reads the file, the environment and the defaults.
 */
import { type RuleId, type RuleSetting } from "./types.js";
import { type WordListEntry } from "./word-list.js";
export declare const CONFIG_FILE_NAME = "ste.config.json";
/** The environment variable that gives the path of the local dictionary. It has priority over `dictionaryPath`. */
export declare const DICTIONARY_ENV = "STE_DICTIONARY";
/** An entry of `wordList` in the configuration file. */
export type WordListEntryConfig = {
    /** The ID of a default entry to change. A new entry gets the first word of `match` as its ID. */
    readonly id?: string;
    readonly match?: string | readonly string[];
    readonly suggest?: string | null;
    readonly note?: string | null;
    readonly severity?: RuleSetting;
    readonly verbOnly?: boolean;
};
export type LimitsConfig = {
    /** The maximum number of words in an instruction. Default: 20 (STE Rule 5.1). */
    readonly instructionWords?: number;
    /** The maximum number of words in a description. Default: 25 (STE Rule 6.3). */
    readonly descriptionWords?: number;
    /** The maximum number of sentences in a paragraph. Default: 6 (STE Rule 6.6). */
    readonly paragraphSentences?: number;
    /** The maximum number of nouns in a noun cluster. Default: 3 (STE Rule 2.1). */
    readonly nounClusterNouns?: number;
};
/** The contents of `ste.config.json`. All properties are optional. */
export type SteConfigFile = {
    readonly $schema?: string;
    readonly include?: readonly string[];
    readonly ignore?: readonly string[];
    readonly technicalNouns?: readonly string[];
    readonly technicalVerbs?: readonly string[];
    readonly properNouns?: readonly string[];
    readonly allowedWords?: readonly string[];
    readonly rules?: Readonly<Record<string, RuleSetting>>;
    readonly wordList?: readonly WordListEntryConfig[];
    readonly limits?: LimitsConfig;
    readonly dictionaryPath?: string | null;
};
export type Limits = Required<LimitsConfig>;
export type ResolvedConfig = {
    /** The directory that `include` and `ignore` are relative to. */
    readonly root: string;
    /** The configuration file, or null when the linter uses the defaults. */
    readonly configFile: string | null;
    readonly include: readonly string[];
    readonly ignore: readonly string[];
    readonly technicalNouns: readonly string[];
    readonly technicalVerbs: readonly string[];
    readonly properNouns: readonly string[];
    readonly allowedWords: readonly string[];
    /** The rule settings from the configuration. A rule without a setting uses its default severity. */
    readonly rules: Readonly<Partial<Record<RuleId, RuleSetting>>>;
    readonly wordList: readonly WordListEntry[];
    readonly limits: Limits;
    /** The absolute path of the local dictionary, or null. */
    readonly dictionaryPath: string | null;
    /** Where the dictionary path came from. */
    readonly dictionarySource: "env" | "config" | null;
};
export declare const DEFAULT_INCLUDE: readonly string[];
export declare const DEFAULT_IGNORE: readonly string[];
export declare const DEFAULT_LIMITS: Limits;
/** An error in the configuration. */
export declare class ConfigError extends Error {
    readonly name: string;
}
/** This function makes sure that `value` is a valid configuration. It throws a `ConfigError` that lists all problems. */
export declare function validateConfig(value: unknown, source: string): SteConfigFile;
/**
 * This function merges the default word list and the entries of the
 * configuration. An entry with the ID (or the first `match` word) of a
 * default entry changes that entry. The severity "off" removes the entry
 * with that ID, and it removes the `match` words from all entries.
 */
export declare function mergeWordList(defaults: readonly WordListEntry[], overrides: readonly WordListEntryConfig[]): WordListEntry[];
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