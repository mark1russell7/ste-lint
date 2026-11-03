/**
 * `@mark1russell7/ste-lint/core`: the linter without a file system, for a
 * browser or another host that has the text in memory. It examines Markdown
 * and MDX. For TypeScript doc comments, give the extractor of
 * `@mark1russell7/ste-lint/code` to `ProseLinter`. The rules are the same
 * rules that the command line uses.
 */

export {
    baseConfig,
    CONFIG_FILE_NAME,
    ConfigError,
    DEFAULT_IGNORE,
    DEFAULT_INCLUDE,
    DEFAULT_LIMITS,
    DICTIONARY_ENV,
    mergeWordList,
    validateConfig,
    type BaseConfigOptions,
    type Limits,
    type LimitsConfig,
    type ResolvedConfig,
    type SteConfigFile,
    type WordListEntryConfig,
} from "./config-core.js";
export { Dictionary, DICTIONARY_FORMAT, DictionaryError, parseDictionary, type DictionaryEntry, type DictionaryLookup } from "./dictionary-core.js";
export { fileKind, ProseLinter, type CodeExtractor, type FileKind, type ProseLinterOptions } from "./engine.js";
export { formatJson, formatText, summarize, type RuleCount, type Summary } from "./format.js";
export { buildLexicon, type Lexicon } from "./lexicon.js";
export { getRule, RULES, type Rule } from "./rules/index.js";
export { isRuleId, RULE_IDS, type Finding, type RuleId, type RuleSetting, type Severity } from "./types.js";
export { DEFAULT_WORD_LIST, type WordListEntry } from "./word-list.js";
