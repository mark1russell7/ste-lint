/**
 * The local dictionary file. The format and the lookup are in
 * `dictionary-core.ts`, which a browser can use. This module reads the file.
 */
import { readFileSync } from "node:fs";
import { DictionaryError, parseDictionary } from "./dictionary-core.js";
export * from "./dictionary-core.js";
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