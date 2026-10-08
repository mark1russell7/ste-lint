/**
 * `@mark1russell7/ste-lint`: a linter for prose in Markdown, MDX and TypeScript doc
 * comments. It is an automated approximation of the writing rules of
 * ASD-STE100 Simplified Technical English. It does not certify that a text
 * obeys the standard.
 */
export { CONFIG_FILE_NAME, ConfigError, DEFAULT_IGNORE, DEFAULT_INCLUDE, DEFAULT_LIMITS, DICTIONARY_ENV, findConfigFile, loadConfig, mergeWordList, resolveConfig, validateConfig, } from "./config.js";
export { Dictionary, DICTIONARY_FORMAT, DictionaryError, loadDictionary, parseDictionary } from "./dictionary.js";
export { findFiles, globToRegExp } from "./files.js";
export { formatJson, formatText, summarize } from "./format.js";
export { buildLexicon } from "./lexicon.js";
export { fileKind, Linter, lintText } from "./lint.js";
export { getRule, RULES } from "./rules/index.js";
export { parseArgs, runCli, USAGE } from "./run-cli.js";
export { isRuleId, RULE_IDS } from "./types.js";
export { DEFAULT_WORD_LIST } from "./word-list.js";
//# sourceMappingURL=index.js.map