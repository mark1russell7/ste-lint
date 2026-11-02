/**
 * The local dictionary file. The format and the lookup are in
 * `dictionary-core.ts`, which a browser can use. This module reads the file.
 */

import { readFileSync } from "node:fs";
import { DictionaryError, parseDictionary, type Dictionary } from "./dictionary-core.js";

export * from "./dictionary-core.js";

/** This function reads a dictionary file. */
export function loadDictionary(path : string) : Dictionary {
    let text : string;
    try {
        text = readFileSync(path, "utf8");
    } catch (error) {
        throw new DictionaryError(`Cannot read the dictionary file ${path}: ${(error as Error).message}`);
    }
    let value : unknown;
    try {
        value = JSON.parse(text);
    } catch (error) {
        throw new DictionaryError(`${path}: the file is not valid JSON: ${(error as Error).message}`);
    }
    return parseDictionary(value, path);
}
