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

/** The settings of the rules of a text. A rule that is off by default needs them. */
export type RuleSettings = SteConfigFile["rules"];

/** A text that the playground loads, with its kind, an optional dictionary and optional settings of the rules. */
export interface LoadRequest {
  readonly text: string;
  readonly mode: Mode;
  readonly dictionary?: { readonly words: readonly string[]; readonly source: string };
  /** The example of a rule that is off by default turns the rule on with these settings. */
  readonly rules?: RuleSettings;
}

/** This function gives the request that loads the bad text of an example in the playground, with its dictionary and its rules. */
export function exampleRequest(example: Example): LoadRequest {
  return {
    text: example.bad,
    mode: example.mode ?? "markdown",
    ...(example.dictionary === undefined ? {} : { dictionary: { words: example.dictionary, source: "example words" } }),
    ...(example.rules === undefined ? {} : { rules: example.rules }),
  };
}

/** The configuration file that agrees with the settings and the rules. The page shows it, so a user can copy it. */
export function configFile(settings: Settings, rules?: RuleSettings): SteConfigFile {
  const file: { -readonly [K in keyof SteConfigFile]: SteConfigFile[K] } = {};
  if (settings.technicalNouns.length > 0) file.technicalNouns = settings.technicalNouns;
  if (settings.technicalVerbs.length > 0) file.technicalVerbs = settings.technicalVerbs;
  if (settings.properNouns.length > 0) file.properNouns = settings.properNouns;
  const changed = Object.fromEntries(Object.entries(settings.limits).filter(([k, v]) => DEFAULT_LIMITS[k as keyof Limits] !== v));
  if (Object.keys(changed).length > 0) file.limits = changed;
  if (rules !== undefined) file.rules = rules;
  return file;
}

/** This function makes a linter for the settings, a dictionary, the extractor of doc comments and the settings of the rules. */
export function makeLinter(settings: Settings = DEFAULT_SETTINGS, dictionary: Dictionary | null = null, extractCode?: CodeExtractor, rules?: RuleSettings): ProseLinter {
  const config = baseConfig(configFile(settings, rules));
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
  return makeLinter(DEFAULT_SETTINGS, dictionary, extractCode, example.rules).lintText(example[which], MODE_PATH[mode]);
}

/** The module of the parser of doc comments. */
export interface CodeModule {
  readonly extractCode: CodeExtractor;
}

/**
 * This function loads the parser of doc comments. It gives null when the import fails, for example when a new deploy
 * removed the file of the old parser. A later call then tries the import again.
 */
export async function loadCodeExtractor(load: () => Promise<CodeModule> = () => import("@mark1russell7/ste-lint/code")): Promise<CodeExtractor | null> {
  try {
    return (await load()).extractCode;
  } catch {
    return null;
  }
}
