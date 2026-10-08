/**
 * The optional local dictionary of approved words.
 *
 * The ASD-STE100 dictionary is copyrighted. This package does not contain
 * it, and the repository must not contain it. Each user makes a local file
 * from their own copy of the standard. Keep that file outside the
 * repository, or in a git-ignored folder, for example `.ste/`.
 *
 * File format (JSON). The short form is an array of approved words:
 *
 * ```json
 * ["a", "about", "make", "makes", "made"]
 * ```
 *
 * The full form is an object with entries:
 *
 * ```json
 * {
 *   "format": "ste-lint-dictionary",
 *   "version": 1,
 *   "entries": [
 *     { "word": "make", "pos": "verb", "forms": ["makes", "made"] },
 *     { "word": "valve", "pos": "noun" },
 *     { "word": "utilize", "pos": "verb", "approved": false, "alternatives": ["use"] }
 *   ]
 * }
 * ```
 *
 * - `word` (necessary): the headword. A phrase, for example "make sure", approves each of its words.
 * - `pos`: the part of speech. A noun also permits its regular plural.
 * - `approved`: `false` for a word that is not approved. The default is `true`.
 * - `forms`: other approved forms, for example the past tense of a verb.
 * - `alternatives`: approved words to use instead of a word that is not approved.
 */
import { readFileSync } from "node:fs";
export const DICTIONARY_FORMAT = "ste-lint-dictionary";
/** An error in a dictionary file. */
export class DictionaryError extends Error {
    name = "DictionaryError";
}
const normalize = (word) => word.trim().toLowerCase().replace(/[’‘]/g, "'");
/** The approved words of a local dictionary. */
export class Dictionary {
    approved = new Set();
    approvedNouns = new Set();
    notApproved = new Map();
    /** The approved nouns. The noun-cluster rule uses them. */
    nouns = new Set();
    /** The approved verbs. The imperative and missing-subject heuristics use them. */
    verbs = new Set();
    constructor(entries) {
        for (const entry of entries) {
            const words = [entry.word, ...(entry.forms ?? [])].flatMap((form) => normalize(form).split(/\s+/)).filter((form) => form.length > 0);
            if (entry.approved === false) {
                for (const word of words)
                    this.notApproved.set(word, entry.alternatives ?? []);
                continue;
            }
            for (const word of words)
                this.approved.add(word);
            const pos = (entry.pos ?? "").toLowerCase();
            const base = normalize(entry.word);
            if (pos === "n" || pos === "noun") {
                this.approvedNouns.add(base);
                this.nouns.add(base);
            }
            if (pos === "v" || pos === "verb")
                this.verbs.add(base);
        }
    }
    /** The number of approved words and forms. */
    get size() {
        return this.approved.size;
    }
    /** The status of `word` in the dictionary. */
    lookup(word) {
        const lower = normalize(word);
        const candidates = [lower];
        if (lower.endsWith("'s"))
            candidates.push(lower.slice(0, -2));
        for (const candidate of candidates) {
            if (this.approved.has(candidate))
                return { status: "approved" };
            const plurals = [candidate.slice(0, -1), candidate.slice(0, -2), candidate.slice(0, -3) + "y"];
            if (candidate.endsWith("s") && plurals.some((singular) => this.approvedNouns.has(singular)))
                return { status: "approved" };
        }
        for (const candidate of candidates) {
            const alternatives = this.notApproved.get(candidate);
            if (alternatives !== undefined)
                return { status: "not-approved", alternatives };
        }
        return { status: "unknown" };
    }
}
/** This function makes a dictionary from parsed JSON. `source` is the file name for error messages. */
export function parseDictionary(value, source) {
    if (Array.isArray(value)) {
        if (!value.every((word) => typeof word === "string")) {
            throw new DictionaryError(`${source}: the array form must contain only strings.`);
        }
        return new Dictionary(value.map((word) => ({ word })));
    }
    if (typeof value !== "object" || value === null) {
        throw new DictionaryError(`${source}: the file must contain an array of words or an object with "entries".`);
    }
    const record = value;
    const format = record["format"];
    if (format !== undefined && format !== DICTIONARY_FORMAT) {
        throw new DictionaryError(`${source}: "format" must be "${DICTIONARY_FORMAT}".`);
    }
    const entries = record["entries"];
    if (!Array.isArray(entries))
        throw new DictionaryError(`${source}: "entries" must be an array.`);
    const parsed = entries.map((entry, index) => parseEntry(entry, `${source}: entries[${index}]`));
    return new Dictionary(parsed);
}
function stringArray(value, where) {
    if (value === undefined)
        return undefined;
    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
        throw new DictionaryError(`${where} must be an array of strings.`);
    }
    return value;
}
function parseEntry(entry, where) {
    if (typeof entry === "string")
        return { word: entry };
    if (typeof entry !== "object" || entry === null)
        throw new DictionaryError(`${where} must be a string or an object.`);
    const record = entry;
    const word = record["word"];
    if (typeof word !== "string" || word.trim().length === 0)
        throw new DictionaryError(`${where}.word must be a string that is not empty.`);
    const pos = record["pos"];
    if (pos !== undefined && typeof pos !== "string")
        throw new DictionaryError(`${where}.pos must be a string.`);
    const approved = record["approved"];
    if (approved !== undefined && typeof approved !== "boolean")
        throw new DictionaryError(`${where}.approved must be true or false.`);
    const forms = stringArray(record["forms"], `${where}.forms`);
    const alternatives = stringArray(record["alternatives"], `${where}.alternatives`);
    return {
        word,
        ...(pos === undefined ? {} : { pos }),
        ...(approved === undefined ? {} : { approved }),
        ...(forms === undefined ? {} : { forms }),
        ...(alternatives === undefined ? {} : { alternatives }),
    };
}
/** This function reads a dictionary file. */
export function loadDictionary(path) {
    let text;
    try {
        text = readFileSync(path, "utf8");
    }
    catch (error) {
        throw new DictionaryError(`Cannot read the dictionary file ${path}: ${error.message}`);
    }
    let value;
    try {
        value = JSON.parse(text);
    }
    catch (error) {
        throw new DictionaryError(`${path}: the file is not valid JSON: ${error.message}`);
    }
    return parseDictionary(value, path);
}
//# sourceMappingURL=dictionary.js.map