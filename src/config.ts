/**
 * The configuration file `ste.config.json`, and the configuration that the
 * linter uses after it reads the file, the environment and the defaults.
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { baseConfig, CONFIG_FILE_NAME, ConfigError, DICTIONARY_ENV, validateConfig, type ResolvedConfig, type SteConfigFile } from "./config-core.js";

export * from "./config-core.js";

/** This function expands a leading `~/` to the home directory, and makes the path absolute. */
export function resolvePath(path : string, base : string) : string {
    const expanded = path === "~" ? homedir() : path.startsWith("~/") || path.startsWith("~\\") ? join(homedir(), path.slice(2)) : path;
    return resolve(base, expanded);
}

export type ResolveOptions = {
    /** The directory of the configuration file, or the working directory. */
    readonly root : string;
    readonly configFile? : string | null;
    /** The working directory. `STE_DICTIONARY` is relative to it. */
    readonly cwd? : string;
    readonly env? : Readonly<Record<string, string | undefined>>;
};

/** This function applies the defaults and the environment to a configuration file. */
export function resolveConfig(file : SteConfigFile, options : ResolveOptions) : ResolvedConfig {
    const env = options.env ?? {};
    const cwd = options.cwd ?? options.root;
    const fromEnv = env[DICTIONARY_ENV];
    let dictionaryPath : string | null = null;
    let dictionarySource : ResolvedConfig["dictionarySource"] = null;
    if (fromEnv !== undefined && fromEnv.trim().length > 0) {
        dictionaryPath = resolvePath(fromEnv.trim(), cwd);
        dictionarySource = "env";
    } else if (typeof file.dictionaryPath === "string" && file.dictionaryPath.trim().length > 0) {
        dictionaryPath = resolvePath(file.dictionaryPath.trim(), options.root);
        dictionarySource = "config";
    }
    return { ...baseConfig(file, { root : options.root, configFile : options.configFile ?? null }), dictionaryPath, dictionarySource };
}

/** The first `ste.config.json` in `cwd` or one of its parent directories, or null. */
export function findConfigFile(cwd : string) : string | null {
    let directory = resolve(cwd);
    for (;;) {
        const candidate = join(directory, CONFIG_FILE_NAME);
        if (existsSync(candidate)) return candidate;
        const parent = dirname(directory);
        if (parent === directory) return null;
        directory = parent;
    }
}

export type LoadOptions = {
    readonly cwd : string;
    /** An explicit configuration file. Without it, the linter looks for `ste.config.json`. */
    readonly configPath? : string;
    readonly env? : Readonly<Record<string, string | undefined>>;
};

/** This function reads the configuration file, if there is one, and resolves it. */
export function loadConfig(options : LoadOptions) : ResolvedConfig {
    const configFile = options.configPath !== undefined ? resolve(options.cwd, options.configPath) : findConfigFile(options.cwd);
    const env = options.env ?? {};
    if (configFile === null) return resolveConfig({}, { root : resolve(options.cwd), cwd : options.cwd, env });
    let text : string;
    try {
        text = readFileSync(configFile, "utf8");
    } catch (error) {
        throw new ConfigError(`Cannot read the configuration file ${configFile}: ${(error as Error).message}`);
    }
    let value : unknown;
    try {
        value = JSON.parse(text);
    } catch (error) {
        throw new ConfigError(`${configFile}: the file is not valid JSON: ${(error as Error).message}`);
    }
    const file = validateConfig(value, configFile);
    return resolveConfig(file, { root : dirname(configFile), configFile, cwd : options.cwd, env });
}
