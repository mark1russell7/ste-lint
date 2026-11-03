// A bad and a good example for each rule and for each entry of the default word list. The tests lint each example
// with the real rules: the bad example gets a finding of its rule or entry, and the good example gets no finding.
import type { RuleId } from "@mark1russell7/ste-lint/core";
import type { Mode } from "./model.ts";

/** One pair of examples. */
export interface Example {
  readonly bad: string;
  readonly good: string;
  /** The kind of text. Default: Markdown. */
  readonly mode?: Mode;
  /** A small list of words for the dictionary. Only the rule unknown-word needs it. */
  readonly dictionary?: readonly string[];
}

/** A list of made-up words for the example of the rule unknown-word. It is not a part of the ASD-STE100 dictionary. */
export const DEMO_DICTIONARY: readonly string[] = ["open", "the", "valve", "before", "you", "start", "pump"];

/** The examples of the rules. */
export const RULE_EXAMPLES: Readonly<Record<RuleId, Example>> = {
  "sentence-length": {
    bad: "The tool reads each Markdown file of the project and examines the paragraphs, the list items, the headings and the table cells, and then it gives a list of the problems that it finds.",
    good: "The tool reads each Markdown file of the project. It examines the paragraphs, the list items, the headings and the table cells. Then it gives a list of the problems.",
  },
  "paragraph-length": {
    bad: "The tool reads the file. It finds the prose. It divides the text into sentences. It counts the words. It examines each rule. It writes the findings. It sets the exit code.",
    good: "The tool reads the file. It finds the prose. It divides the text into sentences. It counts the words.\n\nThen the tool examines each rule. It writes the findings. It sets the exit code.",
  },
  "modal-verb": { bad: "You should restart the server.", good: "Restart the server." },
  semicolon: { bad: "The test passed; the build failed.", good: "The test passed, but the build failed." },
  "latin-abbreviation": { bad: "Use a short name, e.g. a verb.", good: "Use a short name, for example a verb." },
  "about-quantity": { bad: "The check takes about 5 seconds.", good: "The check takes approximately 5 seconds." },
  "word-list": { bad: "Utilize the cache in order to save time.", good: "Use the cache to save time." },
  "gendered-pronoun": { bad: "The user can change his password.", good: "The user can change the password." },
  "first-person": { bad: "I wrote this guide for my team.", good: "We wrote this guide for the team." },
  "passive-instruction": { bad: "The port must be set before the start.", good: "Set the port before the start." },
  "noun-cluster": { bad: "The memory usage threshold value is low.", good: "The threshold of the memory usage is low." },
  "missing-subject": {
    bad: "/** Gives the count of the open files. */\nexport function openFiles(): number {\n  return 0;\n}\n",
    good: "/** This function gives the count of the open files. */\nexport function openFiles(): number {\n  return 0;\n}\n",
    mode: "doc",
  },
  "ing-verb": { bad: "Stop the tool by closing the tab.", good: "To stop the tool, close the tab." },
  "unknown-word": {
    bad: "Open the faucet before you start the pump.",
    good: "Open the valve before you start the pump.",
    dictionary: DEMO_DICTIONARY,
  },
};

/** The examples of the entries of the default word list, by the ID of the entry. */
export const WORD_EXAMPLES: Readonly<Record<string, Example>> = {
  utilize: { bad: "Utilize the cache for large files.", good: "Use the cache for large files." },
  initiate: { bad: "The script initiates the backup.", good: "The script starts the backup." },
  ensure: { bad: "Ensure the port is free.", good: "Make sure that the port is free." },
  via: { bad: "Send the file via the API.", good: "Send the file through the API." },
  leverage: { bad: "The tool leverages the cache.", good: "The tool uses the cache." },
  facilitate: { bad: "The log facilitates the analysis.", good: "The log makes the analysis easier." },
  commence: { bad: "The upload commences at noon.", good: "The upload starts at noon." },
  terminate: { bad: "The server terminates the session.", good: "The server stops the session." },
  obtain: { bad: "Obtain a token from the settings page.", good: "Get a token from the settings page." },
  assist: { bad: "The wizard assists the user.", good: "The wizard helps the user." },
  modify: { bad: "Modify the path in the file.", good: "Change the path in the file." },
  indicate: { bad: "A red dot indicates an error.", good: "A red dot shows an error." },
  demonstrate: { bad: "The test demonstrates the fault.", good: "The test shows the fault." },
  perform: { bad: "The job performs a full scan.", good: "The job does a full scan." },
  attempt: { bad: "The client attempts a second connection.", good: "The client tries a second connection." },
  numerous: { bad: "The page has numerous links.", good: "The page has 12 links." },
  additional: { bad: "Add additional tests.", good: "Add more tests." },
  additionally: { bad: "Additionally, the tool examines the links.", good: "The tool also examines the links." },
  regarding: { bad: "Send questions regarding the API to the team.", good: "Send questions about the API to the team." },
  hence: { bad: "The disk is full, hence the error.", good: "The disk is full. Thus, the tool gives an error." },
  "prior to": { bad: "Save the file prior to the upload.", good: "Save the file before the upload." },
  "in order to": { bad: "Restart the server in order to apply the change.", good: "Restart the server to apply the change." },
  "due to the fact that": { bad: "The build fails due to the fact that the key is old.", good: "The build fails because the key is old." },
  "due to": { bad: "The build fails due to an old key.", good: "The build fails because of an old key." },
  "in the event that": { bad: "In the event that the test fails, open the log.", good: "If the test fails, open the log." },
  "at this point in time": { bad: "At this point in time, the API is stable.", good: "At this time, the API is stable." },
  "in an effort to": { bad: "We keep the files in an effort to save time.", good: "We keep the files to save time." },
  "for the purpose of": { bad: "The flag exists for the purpose of tests.", good: "The flag exists for tests." },
  "with respect to": { bad: "The limits with respect to memory are strict.", good: "The limits for memory are strict." },
  "as well as": { bad: "The tool examines Markdown as well as TypeScript.", good: "The tool examines Markdown and TypeScript." },
  "a number of": { bad: "The page has a number of errors.", good: "The page has 3 errors." },
  "is able to": { bad: "The parser is able to read MDX.", good: "The parser can read MDX." },
  "such as": { bad: "The tool reads text files such as the README.", good: "The tool reads text files, for example the README." },
  "follow these steps": { bad: "Follow these steps to install the tool.", good: "Do these steps to install the tool." },
  however: { bad: "The test passes. However, it is slow.", good: "The test passes. But it is slow." },
  therefore: { bad: "The key is old. Therefore, the login fails.", good: "The key is old. Thus, the login fails." },
  "whether or not": { bad: "Examine whether the port is open.", good: "Examine if the port is open." },
  allow: { bad: "The flag allows a second try.", good: "The flag lets the tool try again." },
  require: { bad: "The tool requires Node 22.", good: "Node 22 is necessary for the tool." },
  "provided that": { bad: "The cache works, provided that the disk has space.", good: "The cache works if the disk has space." },
  provide: { bad: "The package provides a command line tool.", good: "The package gives a command line tool." },
  execute: { bad: "Execute the script.", good: "Start the script." },
  create: { bad: "Create a new branch.", good: "Make a new branch." },
  kill: { bad: "Kill the process.", good: "Stop the process." },
  displays: { bad: "The result is displayed in the panel.", good: "The panel shows the result." },
  display: { bad: "The panel displays the result.", good: "The panel shows the result." },
  returns: { bad: "The function returns the count.", good: "The function gives the count." },
  return: { bad: "Return the value to the caller.", good: "Give the value to the caller." },
  call: { bad: "Call the function again.", good: "Use the function again." },
  ran: { bad: "The job ran at noon.", good: "The job started at noon." },
  run: { bad: "Run the tests.", good: "Start the tests." },
  see: { bad: "For details, see the README.", good: "For details, refer to the README." },
  simple: { bad: "The setup is simple.", good: "The setup has 2 steps." },
  just: { bad: "Just open the file.", good: "Open the file." },
  basically: { bad: "The tool is basically a parser.", good: "The tool is a parser." },
  please: { bad: "Please close the tab.", good: "Close the tab." },
  currently: { bad: "The tool currently reads Markdown.", good: "At this time, the tool reads Markdown." },
  never: { bad: "Never delete the lock file.", good: "Do not delete the lock file." },
};
