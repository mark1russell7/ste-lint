/**
 * The local dictionary file. The format and the lookup are in
 * `dictionary-core.ts`, which a browser can use. This module reads the file.
 */
import { type Dictionary } from "./dictionary-core.js";
export * from "./dictionary-core.js";
/** This function reads a dictionary file. */
export declare function loadDictionary(path: string): Dictionary;
//# sourceMappingURL=dictionary.d.ts.map