/**
 * File discovery: glob patterns to files.
 *
 * The glob syntax:
 *
 * - `*` matches characters in one path segment
 * - `**` matches zero or more segments
 * - `?` matches one character
 * - `{a,b}` matches one of the alternatives
 * - `[abc]` or `[!abc]` matches one character of a set.
 *
 * Patterns use `/` on all platforms.
 */
/** True when `pattern` has glob characters. */
export declare function isGlob(pattern: string): boolean;
/** This function converts a glob pattern to a regular expression that matches a whole relative path. */
export declare function globToRegExp(glob: string): RegExp;
/** The part of a pattern before the first segment with glob characters. The walk starts in that directory. */
export declare function globBase(glob: string): string;
export type FindOptions = {
    /** The directory that the patterns are relative to. */
    readonly root: string;
    readonly include: readonly string[];
    readonly ignore: readonly string[];
};
/**
 * This function finds the files that match the include patterns and no
 * ignore pattern. A pattern without glob characters is a file name, and
 * the ignore patterns do not apply to it. The result has absolute paths,
 * in sorted order, without duplicates.
 */
export declare function findFiles(options: FindOptions): string[];
//# sourceMappingURL=files.d.ts.map