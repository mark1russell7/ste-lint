## Install

Add the package as a development dependency of the root of the repository:

```sh
pnpm add -D @mark1russell7/ste-lint
```

Add a script to the root `package.json`:

```json
{ "scripts": { "lint:ste": "ste-lint" } }
```

Start the tool from the root of the repository:

```sh
pnpm lint:ste
pnpm lint:ste --format json
pnpm lint:ste --max-warnings 0 README.md "docs/**/*.md"
```

The exit code is 0 when the text has no errors. It is 1 when the text has errors, or more warnings than the maximum. Put the command in CI, and a pull request with a problem fails.

A file `ste.config.json` at the root sets the files, the glossary, the rules and the limits. The settings of the playground give the same file.

### In a browser

The entry `@mark1russell7/ste-lint/core` has the same rules, with no file system. This playground uses it. The entry is new in version 0.1.2.

```ts
import { baseConfig, ProseLinter } from "@mark1russell7/ste-lint/core";

const linter = new ProseLinter(baseConfig());
const findings = linter.lintText("You should restart the server.", "notes.md");
```
