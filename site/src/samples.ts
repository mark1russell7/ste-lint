// The sample texts of the playground. The first sample is the text in the editor when the page opens.
import type { Mode } from "./model.ts";

/** One sample text of the playground. */
export interface Sample {
  readonly id: string;
  readonly label: string;
  readonly mode: Mode;
  readonly text: string;
}

export const SAMPLES: readonly Sample[] = [
  {
    id: "problems",
    label: "Many problems",
    mode: "markdown",
    text: `# Getting started

You should utilize the command line tool in order to check the docs; it is basically simple, e.g. for a README file.

The check takes about 5 seconds. Please make sure that the configuration file is created before you run it. The user can then edit his settings via the menu, and our team is able to help.

The tool stops the scan by closing each file. Each file of the project that the tool examines gets a line in the report, with the rule, the line number and the column number, and a short message that tells the reader which word to change.
`,
  },
  {
    id: "fixed",
    label: "The same text in STE",
    mode: "markdown",
    text: `# Getting started

Use the command line tool to examine the documents. For example, examine a README file.

The check takes approximately 5 seconds. Make sure that the configuration file exists before you start the tool. Then the user can change the settings in the menu. If you have a problem, the team can help.

Each file that the tool examines gets a line in the report. The line gives the rule, the line number and the column number. A short message tells the reader which word to change.
`,
  },
  {
    id: "readme",
    label: "A README section",
    mode: "markdown",
    text: `## Installation

To install the package, simply run \`pnpm add my-lib\`. However, Node 22 is required.

Additionally, the CLI provides numerous options, such as \`--watch\`, which allows you to re-run the build whenever a file is modified.

1. Clone the repository.
2. The dependencies are installed by the setup script.
3. Run the tests prior to opening a pull request.
`,
  },
  {
    id: "doc",
    label: "TypeScript doc comments",
    mode: "doc",
    text: `/**
 * Returns the number of open sessions.
 *
 * @remarks Should be called after the server has started. It is basically a counter.
 * @param host - The host to query.
 */
export function openSessions(host: string): number {
  return host.length;
}

/** This function gives the version of the protocol. */
export const version = (): string => "1.0";
`,
  },
];
