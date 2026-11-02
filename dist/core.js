/**
 * `@mark1russell7/ste-lint/core`: the linter without a file system, for a
 * browser or another host that has the text in memory. It examines Markdown
 * and MDX. For TypeScript doc comments, give the extractor of
 * `@mark1russell7/ste-lint/code` to `ProseLinter`. The rules are the same
 * rules that the command line uses.
 */
export { baseConfig, CONFIG_FILE_NAME, ConfigError, DEFAULT_IGNORE, DEFAULT_INCLUDE, DEFAULT_LIMITS, DICTIONARY_ENV, mergeWordList, validateConfig, } from "./config-core.js";
export { Dictionary, DICTIONARY_FORMAT, DictionaryError, parseDictionary } from "./dictionary-core.js";
export { fileKind, ProseLinter } from "./engine.js";
export { formatJson, formatText, summarize } from "./format.js";
export { buildLexicon } from "./lexicon.js";
export { getRule, RULES } from "./rules/index.js";
export { isRuleId, RULE_IDS } from "./types.js";
export { DEFAULT_WORD_LIST } from "./word-list.js";
//# sourceMappingURL=core.js.map