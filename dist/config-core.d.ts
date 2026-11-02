/**
 * The parts of the configuration that need no file system: the types of
 * `ste.config.json`, the defaults, the validation and the word list merge.
 * A browser can use this module.
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
export type BaseConfigOptions = {
    /** The directory that `include` and `ignore` are relative to. Default: the empty string. */
    readonly root?: string;
    readonly configFile?: string | null;
};
/**
 * This function applies the defaults to a configuration file. It reads no
 * file and no environment variable, thus the result has no dictionary path.
 */
export declare function baseConfig(file?: SteConfigFile, options?: BaseConfigOptions): ResolvedConfig;
//# sourceMappingURL=config-core.d.ts.map