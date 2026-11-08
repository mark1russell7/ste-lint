// The linter of the site: the core of the package with the settings of the page. It has no DOM.
import {
  baseConfig,
  buildLexicon,
  DEFAULT_LIMITS,
  parseDictionary,
  ProseLinter,
  type CodeExtractor,
  type Dictionary,
  type Finding,
  type Limits,
  type SteConfigFile,
} from "@mark1russell7/ste-lint/core";
import type { Example } from "./examples.ts";
import { MODE_PATH, type Mode } from "./model.ts";

/** The settings of the playground: the parts of `ste.config.json` that the page can change. */
export interface Settings {
  readonly limits: Limits;
  readonly technicalNouns: readonly string[];
  readonly technicalVerbs: readonly string[];
  readonly properNouns: readonly string[];
}

export const DEFAULT_SETTINGS: Settings = { limits: DEFAULT_LIMITS, technicalNouns: [], technicalVerbs: [], properNouns: [] };

/** The configuration file that agrees with the settings. The page shows it, so a user can copy it. */
export function configFile(settings: Settings): SteConfigFile {
  const file: { -readonly [K in keyof SteConfigFile]: SteConfigFile[K] } = {};
  if (settings.technicalNouns.length > 0) file.technicalNouns = settings.technicalNouns;
  if (settings.technicalVerbs.length > 0) file.technicalVerbs = settings.technicalVerbs;
  if (settings.properNouns.length > 0) file.properNouns = settings.properNouns;
  const changed = Object.fromEntries(Object.entries(settings.limits).filter(([k, v]) => DEFAULT_LIMITS[k as keyof Limits] !== v));
  if (Object.keys(changed).length > 0) file.limits = changed;
  return file;
}

/** This function makes a linter for the settings, a dictionary and the extractor of doc comments. */
export function makeLinter(settings: Settings = DEFAULT_SETTINGS, dictionary: Dictionary | null = null, extractCode?: CodeExtractor): ProseLinter {
  const config = baseConfig(configFile(settings));
  return new ProseLinter(config, buildLexicon(config, dictionary), extractCode === undefined ? {} : { extractCode });
}

/** This function makes a dictionary from a list of words. */
export function wordsDictionary(words: readonly string[], source = "words"): Dictionary {
  return parseDictionary([...words], source);
}

/** The findings of one text of an example. */
export function lintExample(example: Example, which: "bad" | "good", extractCode?: CodeExtractor): Finding[] {
  const dictionary = example.dictionary === undefined ? null : wordsDictionary(example.dictionary, "example");
  const mode: Mode = example.mode ?? "markdown";
  if (example.rules === undefined) return makeLinter(DEFAULT_SETTINGS, dictionary, extractCode).lintText(example[which], MODE_PATH[mode]);
  const config = baseConfig({ ...configFile(DEFAULT_SETTINGS), rules: example.rules });
  return new ProseLinter(config, buildLexicon(config, dictionary), extractCode === undefined ? {} : { extractCode }).lintText(example[which], MODE_PATH[mode]);
}
