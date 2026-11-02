/**
 * The parts of the configuration that need no file system: the types of
 * `ste.config.json`, the defaults, the validation and the word list merge.
 * A browser can use this module.
 */
import { isRuleId, RULE_IDS } from "./types.js";
import { DEFAULT_WORD_LIST } from "./word-list.js";
export const CONFIG_FILE_NAME = "ste.config.json";
/** The environment variable that gives the path of the local dictionary. It has priority over `dictionaryPath`. */
export const DICTIONARY_ENV = "STE_DICTIONARY";
export const DEFAULT_INCLUDE = [
    "README.md",
    "docs/**/*.{md,mdx}",
    "packages/*/README.md",
    "packages/*/src/**/*.{ts,tsx}",
    "packages/*/build/**/*.{ts,tsx}",
    "packages/*/commands/**/*.{ts,tsx}",
    "packages/*/*.config.{ts,mts}",
];
export const DEFAULT_IGNORE = [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.d.ts",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
];
export const DEFAULT_LIMITS = {
    instructionWords: 20,
    descriptionWords: 25,
    paragraphSentences: 6,
    nounClusterNouns: 3,
};
/** An error in the configuration. */
export class ConfigError extends Error {
    name = "ConfigError";
}
const SETTINGS = ["error", "warning", "off"];
const KNOWN_KEYS = new Set([
    "$schema", "include", "ignore", "technicalNouns", "technicalVerbs", "properNouns", "allowedWords",
    "rules", "wordList", "limits", "dictionaryPath",
]);
const WORD_LIST_KEYS = new Set(["id", "match", "suggest", "note", "severity", "verbOnly"]);
/** This function makes sure that `value` is a valid configuration. It throws a `ConfigError` that lists all problems. */
export function validateConfig(value, source) {
    const problems = [];
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new ConfigError(`${source}: the configuration must be a JSON object.`);
    }
    const record = value;
    for (const key of Object.keys(record)) {
        if (!KNOWN_KEYS.has(key))
            problems.push(`"${key}" is not a known property. Known properties: ${[...KNOWN_KEYS].join(", ")}.`);
    }
    for (const key of ["include", "ignore", "technicalNouns", "technicalVerbs", "properNouns", "allowedWords"]) {
        const item = record[key];
        if (item !== undefined && !(Array.isArray(item) && item.every((entry) => typeof entry === "string"))) {
            problems.push(`"${key}" must be an array of strings.`);
        }
    }
    const rules = record["rules"];
    if (rules !== undefined) {
        if (typeof rules !== "object" || rules === null || Array.isArray(rules)) {
            problems.push(`"rules" must be an object.`);
        }
        else {
            for (const [id, setting] of Object.entries(rules)) {
                if (!isRuleId(id))
                    problems.push(`"rules.${id}" is not a known rule. Known rules: ${RULE_IDS.join(", ")}.`);
                if (typeof setting !== "string" || !SETTINGS.includes(setting))
                    problems.push(`"rules.${id}" must be "error", "warning" or "off".`);
            }
        }
    }
    const limits = record["limits"];
    if (limits !== undefined) {
        if (typeof limits !== "object" || limits === null || Array.isArray(limits)) {
            problems.push(`"limits" must be an object.`);
        }
        else {
            for (const [key, limit] of Object.entries(limits)) {
                if (!Object.hasOwn(DEFAULT_LIMITS, key))
                    problems.push(`"limits.${key}" is not a known limit. Known limits: ${Object.keys(DEFAULT_LIMITS).join(", ")}.`);
                if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1)
                    problems.push(`"limits.${key}" must be an integer of 1 or more.`);
            }
        }
    }
    const dictionaryPath = record["dictionaryPath"];
    if (dictionaryPath !== undefined && dictionaryPath !== null && typeof dictionaryPath !== "string") {
        problems.push(`"dictionaryPath" must be a string or null.`);
    }
    const wordList = record["wordList"];
    if (wordList !== undefined) {
        if (!Array.isArray(wordList)) {
            problems.push(`"wordList" must be an array.`);
        }
        else {
            wordList.forEach((item, index) => problems.push(...validateWordListEntry(item, `wordList[${index}]`)));
        }
    }
    if (problems.length > 0)
        throw new ConfigError(`${source}:\n  - ${problems.join("\n  - ")}`);
    return record;
}
function validateWordListEntry(item, where) {
    if (typeof item !== "object" || item === null || Array.isArray(item))
        return [`"${where}" must be an object.`];
    const problems = [];
    const entry = item;
    for (const key of Object.keys(entry)) {
        if (!WORD_LIST_KEYS.has(key))
            problems.push(`"${where}.${key}" is not a known property.`);
    }
    const match = entry["match"];
    const matchValid = typeof match === "string" || (Array.isArray(match) && match.length > 0 && match.every((word) => typeof word === "string"));
    if (match !== undefined && !matchValid)
        problems.push(`"${where}.match" must be a string or an array of strings.`);
    if (entry["id"] !== undefined && typeof entry["id"] !== "string")
        problems.push(`"${where}.id" must be a string.`);
    if (entry["id"] === undefined && match === undefined)
        problems.push(`"${where}" must have "id" or "match".`);
    for (const key of ["suggest", "note"]) {
        const text = entry[key];
        if (text !== undefined && text !== null && typeof text !== "string")
            problems.push(`"${where}.${key}" must be a string or null.`);
    }
    const severity = entry["severity"];
    if (severity !== undefined && (typeof severity !== "string" || !SETTINGS.includes(severity)))
        problems.push(`"${where}.severity" must be "error", "warning" or "off".`);
    if (entry["verbOnly"] !== undefined && typeof entry["verbOnly"] !== "boolean")
        problems.push(`"${where}.verbOnly" must be true or false.`);
    return problems;
}
/**
 * This function merges the default word list and the entries of the
 * configuration. An entry with the ID (or the first `match` word) of a
 * default entry changes that entry. The severity "off" removes the entry
 * with that ID, and it removes the `match` words from all entries.
 */
export function mergeWordList(defaults, overrides) {
    const entries = new Map(defaults.map((entry) => [entry.id, entry]));
    for (const override of overrides) {
        const match = override.match === undefined ? undefined : typeof override.match === "string" ? [override.match] : [...override.match];
        const id = override.id ?? match[0];
        const base = entries.get(id) ?? null;
        if (override.severity === "off") {
            entries.set(id, null);
            const removed = new Set((match ?? []).map((word) => word.toLowerCase()));
            for (const [key, entry] of entries) {
                if (entry === null)
                    continue;
                const kept = entry.match.filter((word) => !removed.has(word.toLowerCase()));
                entries.set(key, kept.length === 0 ? null : { ...entry, match: kept });
            }
            continue;
        }
        const merged = {
            id,
            match: match ?? base?.match ?? [id],
            suggest: override.suggest !== undefined ? override.suggest : base?.suggest ?? null,
            note: override.note !== undefined ? override.note : base?.note ?? null,
            severity: override.severity ?? base?.severity ?? "error",
            verbOnly: override.verbOnly ?? base?.verbOnly ?? false,
            context: base?.context ?? null,
        };
        entries.set(id, merged);
    }
    return [...entries.values()].filter((entry) => entry !== null);
}
/**
 * This function applies the defaults to a configuration file. It reads no
 * file and no environment variable, thus the result has no dictionary path.
 */
export function baseConfig(file = {}, options = {}) {
    const rules = {};
    for (const [id, setting] of Object.entries(file.rules ?? {})) {
        if (isRuleId(id))
            rules[id] = setting;
    }
    return {
        root: options.root ?? "",
        configFile: options.configFile ?? null,
        include: file.include ?? DEFAULT_INCLUDE,
        ignore: file.ignore ?? DEFAULT_IGNORE,
        technicalNouns: file.technicalNouns ?? [],
        technicalVerbs: file.technicalVerbs ?? [],
        properNouns: file.properNouns ?? [],
        allowedWords: file.allowedWords ?? [],
        rules,
        wordList: mergeWordList(DEFAULT_WORD_LIST, file.wordList ?? []),
        limits: { ...DEFAULT_LIMITS, ...file.limits },
        dictionaryPath: null,
        dictionarySource: null,
    };
}
//# sourceMappingURL=config-core.js.map