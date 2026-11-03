// The playground: the editor with the marks of the findings, the list of the findings, the counts by rule and the settings.
import { DEFAULT_LIMITS, DEFAULT_WORD_LIST, parseDictionary, type CodeExtractor, type Dictionary, type Limits, type RuleId } from "@mark1russell7/ste-lint/core";
import { byId, copyText, h, Segmented } from "./chrome.ts";
import { configFile, DEFAULT_SETTINGS, makeLinter, wordsDictionary, type Settings } from "./lint.ts";
import {
  applyFix,
  encodeShare,
  findingsAt,
  MODE_LABEL,
  MODE_PATH,
  MODES,
  segments,
  shiftFindings,
  SPAN_RULES,
  tallyByRule,
  typographic,
  viewFindings,
  type Mode,
  type ViewFinding,
} from "./model.ts";
import { SAMPLES } from "./samples.ts";

/** The wait after a key, before the linter examines the text again. */
const DEBOUNCE_MS = 150;

/** The number of findings that a narrow screen shows before "Show all". */
const COLLAPSED = 6;

/** The keys of the limits that the settings show. */
const LIMIT_KEYS = ["instructionWords", "descriptionWords", "paragraphSentences", "nounClusterNouns"] as const satisfies readonly (keyof Limits)[];
const GLOSSARY_KEYS = ["technicalNouns", "technicalVerbs", "properNouns"] as const;

/** The things that the playground tells the rest of the page. */
export interface PlaygroundEvents {
  /** The user asks for the rule or the word list entry of a finding. */
  readonly onExplain: (key: string) => void;
  /** The TypeScript parser for the doc comments is loaded. */
  readonly onCodeExtractor: (extractCode: CodeExtractor) => void;
}

/** A text that the playground loads, with its kind and an optional dictionary. */
export interface LoadRequest {
  readonly text: string;
  readonly mode: Mode;
  readonly dictionary?: { readonly words: readonly string[]; readonly source: string };
}

const terms = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

export class Playground {
  private readonly editor = byId<HTMLTextAreaElement>("editor");
  private readonly backdrop = byId("backdrop");
  private readonly status = byId("status");
  private readonly caretNote = byId("caret-note");
  private readonly list = byId<HTMLOListElement>("findings");
  private readonly tally = byId("tally");
  private readonly totals = byId("totals");
  private readonly sample = byId<HTMLSelectElement>("sample");
  private readonly modes: Segmented<Mode>;

  private mode: Mode = "markdown";
  private settings: Settings = DEFAULT_SETTINGS;
  private dictionary: Dictionary | null = null;
  private extractCode: CodeExtractor | null = null;
  private linted = "";
  private findings: ViewFinding[] = [];
  private ruleFilter: RuleId | null = null;
  private active: number | null = null;
  private timer = 0;
  private lastMs = 0;
  /** On a narrow screen the list shows the first findings only, until the user asks for all. */
  private expanded = false;

  constructor(private readonly events: PlaygroundEvents) {
    this.modes = new Segmented(
      byId("modes"),
      MODES.map((m) => ({ value: m, label: MODE_LABEL[m] })),
      this.mode,
      (mode) => void this.setMode(mode),
    );
    this.setupSamples();
    this.setupEditor();
    this.setupSettings();
    byId<HTMLButtonElement>("clear").addEventListener("click", () => this.load({ text: "", mode: this.mode }, true));
    const share = byId<HTMLButtonElement>("share");
    share.addEventListener("click", () => {
      const url = new URL(location.href);
      url.search = encodeShare(this.editor.value, this.mode);
      url.hash = "playground";
      history.replaceState(null, "", url);
      void copyText(share, url.href, "Link copied");
    });
    new ResizeObserver(() => this.fit()).observe(this.editor);
    // The web font loads after the first fit and changes the line breaks, so the text area fits its text again.
    void document.fonts.ready.then(() => this.fit());
    document.fonts.addEventListener("loadingdone", () => this.fit());
  }

  /** This function puts a text in the editor and examines it at once. */
  async load(request: LoadRequest, focus = false): Promise<void> {
    if (request.dictionary !== undefined) this.setDictionary(wordsDictionary(request.dictionary.words, request.dictionary.source), request.dictionary.source);
    this.editor.value = request.text;
    this.sample.value = SAMPLES.find((s) => s.text === request.text && s.mode === request.mode)?.id ?? "";
    this.ruleFilter = null;
    this.active = null;
    this.expanded = false;
    this.modes.set(request.mode);
    await this.setMode(request.mode);
    if (focus) {
      this.editor.focus({ preventScroll: true });
      this.editor.setSelectionRange(0, 0);
    }
  }

  // ---- Setup ----

  private setupSamples(): void {
    this.sample.replaceChildren(h("option", { value: "", hidden: true }, "Your text"), ...SAMPLES.map((s) => h("option", { value: s.id }, s.label)));
    this.sample.addEventListener("change", () => {
      const sample = SAMPLES.find((s) => s.id === this.sample.value);
      if (sample !== undefined) void this.load({ text: sample.text, mode: sample.mode });
    });
  }

  private setupEditor(): void {
    this.editor.addEventListener("input", () => {
      // The marks move with the text at once. The linter examines the text after a short wait.
      this.findings = shiftFindings(this.linted, this.editor.value, this.findings);
      this.linted = this.editor.value;
      this.sample.value = SAMPLES.find((s) => s.text === this.editor.value && s.mode === this.mode)?.id ?? "";
      this.fit();
      this.paint();
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.run(), DEBOUNCE_MS);
    });
    const caret = (): void => this.showCaret();
    this.editor.addEventListener("keyup", caret);
    this.editor.addEventListener("click", caret);
    this.editor.addEventListener("focus", caret);
    this.editor.addEventListener("blur", () => {
      this.caretNote.hidden = true;
    });
  }

  private setupSettings(): void {
    for (const key of LIMIT_KEYS) {
      const input = byId<HTMLInputElement>(`lim-${key}`);
      input.value = String(DEFAULT_LIMITS[key]);
      input.placeholder = String(DEFAULT_LIMITS[key]);
      input.addEventListener("input", () => {
        const n = Number.parseInt(input.value, 10);
        const value = Number.isInteger(n) && n > 0 ? n : DEFAULT_LIMITS[key];
        this.updateSettings({ ...this.settings, limits: { ...this.settings.limits, [key]: value } });
      });
    }
    for (const key of GLOSSARY_KEYS) {
      const input = byId<HTMLTextAreaElement>(`g-${key}`);
      input.addEventListener("input", () => this.updateSettings({ ...this.settings, [key]: terms(input.value) }));
    }
    const file = byId<HTMLInputElement>("dict-file");
    file.addEventListener("change", async () => {
      const chosen = file.files?.[0];
      if (chosen === undefined) return;
      try {
        this.setDictionary(parseDictionary(JSON.parse(await chosen.text()), chosen.name), chosen.name);
      } catch (error) {
        byId("dict-status").textContent = `The file was not loaded: ${error instanceof Error ? error.message : String(error)}`;
      }
      file.value = "";
      this.run();
    });
    byId("dict-clear").addEventListener("click", () => {
      this.setDictionary(null, "");
      this.run();
    });
    this.showConfig();
  }

  private updateSettings(settings: Settings): void {
    this.settings = settings;
    this.showConfig();
    this.run();
  }

  private showConfig(): void {
    byId("config-out").textContent = JSON.stringify({ $schema: "./node_modules/@mark1russell7/ste-lint/ste.config.schema.json", ...configFile(this.settings) }, null, 2);
  }

  private setDictionary(dictionary: Dictionary | null, source: string): void {
    this.dictionary = dictionary;
    byId("dict-clear").hidden = dictionary === null;
    byId("dict-status").textContent =
      dictionary === null ? "No dictionary." : `Dictionary "${source}": ${dictionary.size} words. The rule unknown-word is on.`;
  }

  private async setMode(mode: Mode): Promise<void> {
    this.mode = mode;
    this.editor.classList.toggle("code", mode === "doc");
    this.backdrop.classList.toggle("code", mode === "doc");
    if (mode === "doc" && this.extractCode === null) {
      this.status.textContent = "Loading the TypeScript parser for the doc comments…";
      this.backdrop.replaceChildren(document.createTextNode(this.editor.value));
      const code = await import("@mark1russell7/ste-lint/code");
      this.extractCode = code.extractCode;
      this.events.onCodeExtractor(code.extractCode);
    }
    this.fit();
    this.run();
  }

  // ---- Lint ----

  private run(): void {
    window.clearTimeout(this.timer);
    if (this.mode === "doc" && this.extractCode === null) return;
    const text = this.editor.value;
    const linter = makeLinter(this.settings, this.dictionary, this.extractCode ?? undefined);
    const t0 = performance.now();
    const raw = linter.lintText(text, MODE_PATH[this.mode]);
    this.lastMs = performance.now() - t0;
    this.linted = text;
    this.findings = viewFindings(text, raw, DEFAULT_WORD_LIST);
    if (this.ruleFilter !== null && !this.findings.some((f) => f.ruleId === this.ruleFilter)) this.ruleFilter = null;
    if (this.active !== null && this.active >= this.findings.length) this.active = null;
    this.paint();
    this.renderTotals();
    this.renderTally();
    this.renderList();
    this.renderStatus();
    if (document.activeElement === this.editor) this.showCaret();
  }

  // ---- Render ----

  /** The text area grows with its text, so the page scrolls and the marks of the backdrop stay under the words. */
  private fit(): void {
    this.editor.style.height = "auto";
    this.editor.style.height = `${this.editor.scrollHeight}px`;
  }

  /** This function writes the marks of the findings in the backdrop, under the text of the text area. */
  private paint(): void {
    const text = this.editor.value;
    const shown = this.visible();
    const byId = new Map(shown.map((f) => [f.id, f]));
    const nodes: Node[] = [];
    for (const part of segments(text, shown)) {
      const chunk = text.slice(part.start, part.end);
      if (part.ids.length === 0) {
        nodes.push(document.createTextNode(chunk));
        continue;
      }
      const cover = part.ids.map((id) => byId.get(id)!);
      const words = cover.filter((f) => !SPAN_RULES.has(f.ruleId));
      const classes: string[] = [];
      if (words.length > 0) classes.push(words.some((f) => f.severity === "error") ? "w-error" : "w-warning");
      if (words.length < cover.length) classes.push("long");
      if (words.length === 0) classes.push("w-none");
      if (this.active !== null && part.ids.includes(this.active)) classes.push("active");
      nodes.push(h("mark", { class: classes.join(" ") }, chunk));
    }
    // A text area shows an empty last line after a final line break. The backdrop needs a character there to agree.
    if (text.endsWith("\n") || text.length === 0) nodes.push(document.createTextNode(" "));
    this.backdrop.replaceChildren(...nodes);
  }

  private visible(): ViewFinding[] {
    return this.ruleFilter === null ? this.findings : this.findings.filter((f) => f.ruleId === this.ruleFilter);
  }

  private renderTotals(): void {
    const errors = this.findings.filter((f) => f.severity === "error").length;
    const warnings = this.findings.length - errors;
    const pills: HTMLElement[] = [];
    if (errors > 0) pills.push(h("span", { class: "pill error" }, `${errors} ${errors === 1 ? "error" : "errors"}`));
    if (warnings > 0) pills.push(h("span", { class: "pill warning" }, `${warnings} ${warnings === 1 ? "warning" : "warnings"}`));
    if (pills.length === 0) pills.push(h("span", { class: "pill ok" }, "No findings"));
    this.totals.replaceChildren(...pills);
  }

  private renderTally(): void {
    const rows = tallyByRule(this.findings);
    if (rows.length === 0) {
      this.tally.replaceChildren();
      return;
    }
    const max = Math.max(...rows.map((r) => r.total));
    const items = rows.map((row) => {
      const pressed = this.ruleFilter === row.ruleId;
      const button = h(
        "button",
        {
          type: "button",
          "aria-pressed": String(pressed),
          title: pressed ? "Show the findings of all rules" : `Show only the findings of ${row.ruleId}`,
        },
        h("span", { class: "rule-id" }, row.ruleId),
        h(
          "span",
          { class: "bar", "aria-hidden": "true" },
          h("span", { class: "e", style: `width:${(row.errors / max) * 100}%` }),
          h("span", { class: "w", style: `width:${(row.warnings / max) * 100}%` }),
        ),
        h("span", { class: "n" }, String(row.total)),
      );
      button.addEventListener("click", () => {
        this.ruleFilter = pressed ? null : row.ruleId;
        this.active = null;
        this.paint();
        this.renderTally();
        this.renderList();
      });
      return h("li", {}, button);
    });
    const shown = this.visible().length;
    const note = h("p", { class: "tally-note" }, h("span", {}, "Findings by rule. Select a rule to show only its findings."));
    if (this.ruleFilter !== null) {
      const all = h("button", { type: "button" }, `Show all ${this.findings.length}`);
      all.addEventListener("click", () => {
        this.ruleFilter = null;
        this.paint();
        this.renderTally();
        this.renderList();
      });
      note.replaceChildren(h("span", {}, `${shown} of ${this.findings.length} findings: ${this.ruleFilter}.`), all);
    }
    this.tally.replaceChildren(h("ol", { "aria-label": "Findings by rule" }, items), note);
  }

  private renderList(): void {
    const shown = this.visible();
    if (shown.length === 0) {
      const empty = this.editor.value.trim() === "" ? "Type or paste text in the editor." : "The linter found no problems in this text.";
      this.list.replaceChildren(h("li", { class: "empty" }, h("strong", {}, this.editor.value.trim() === "" ? "No text" : "No findings"), empty));
      return;
    }
    const narrow = matchMedia("(max-width: 959px)").matches;
    const cut = narrow && !this.expanded && shown.length > COLLAPSED ? COLLAPSED : shown.length;
    const items: HTMLLIElement[] = shown.slice(0, cut).map((f) => this.findingItem(f));
    if (cut < shown.length) {
      const more = h("button", { type: "button" }, `Show all ${shown.length} findings`);
      more.addEventListener("click", () => {
        this.expanded = true;
        this.renderList();
        this.list.querySelectorAll<HTMLButtonElement>(".jump")[cut]?.focus();
      });
      items.push(h("li", { class: "more" }, more));
    }
    this.list.replaceChildren(...items);
  }

  private findingItem(f: ViewFinding): HTMLLIElement {
    const jump = h(
      "button",
      { type: "button", class: "jump", "aria-label": `${f.severity} ${f.ruleId}, line ${f.line}: ${f.message} Select to show it in the text.` },
      h(
        "span",
        { class: "meta" },
        h("span", { class: "rule-id" }, f.ruleId),
        h("span", { class: `sev ${f.severity}` }, f.severity),
        h("span", {}, `line ${f.line}, column ${f.column}`),
      ),
      f.excerpt.trim() !== "" && h("span", { class: "excerpt" }, f.excerpt.length > 90 ? `${f.excerpt.slice(0, 90)}…` : f.excerpt),
      h("span", { class: "msg" }, typographic(f.message)),
    );
    jump.addEventListener("click", () => this.select(f));
    const fixes = h("div", { class: "fixes" });
    if (f.suggestions.length > 0 && f.fixes.length === 0) {
      fixes.append(h("span", { class: "label" }, "Write"), ...f.suggestions.map((s) => h("span", { class: "suggest" }, s)));
    }
    for (const fix of f.fixes) {
      const button = h("button", { type: "button" }, typographic(fix.label));
      button.addEventListener("click", () => {
        const next = applyFix(this.editor.value, f, fix);
        this.editor.value = next.text;
        this.active = null;
        this.fit();
        this.run();
        this.editor.focus({ preventScroll: true });
        this.editor.setSelectionRange(next.caret, next.caret);
      });
      fixes.append(button);
    }
    const explain = h("button", { type: "button", class: "about" }, f.entryId === null ? "About the rule" : "About the entry");
    explain.addEventListener("click", () => this.events.onExplain(f.entryId === null ? `rule:${f.ruleId}` : `word:${f.entryId}`));
    fixes.append(explain);
    return h("li", { class: `finding ${f.severity}${this.active === f.id ? " active" : ""}`, "data-id": f.id }, jump, fixes);
  }

  private renderStatus(): void {
    const words = this.editor.value.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
    const n = this.findings.length;
    this.status.textContent = `${n} ${n === 1 ? "finding" : "findings"} in ${words} ${words === 1 ? "word" : "words"}. The linter took ${this.lastMs < 1 ? "less than 1" : Math.round(this.lastMs)} ms in this browser.`;
  }

  /** This function selects the text of a finding in the editor and marks the finding in the list. */
  private select(f: ViewFinding): void {
    this.active = f.id;
    this.expanded = true;
    this.paint();
    this.renderList();
    this.editor.focus({ preventScroll: true });
    this.editor.setSelectionRange(f.start, f.end);
    const mark = this.backdrop.querySelector(".active");
    (mark ?? this.editor).scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    this.showCaret();
  }

  /** The findings at the caret show under the editor, so a keyboard user reads them with no list. */
  private showCaret(): void {
    if (this.linted !== this.editor.value) return;
    const at = findingsAt(this.visible(), this.editor.selectionStart).filter((f) => f.start < f.end);
    const words = at.filter((f) => !SPAN_RULES.has(f.ruleId));
    const shown = words.length > 0 ? words : at;
    if (shown.length === 0) {
      this.caretNote.hidden = true;
      return;
    }
    this.caretNote.replaceChildren(...shown.map((f) => h("p", {}, h("strong", {}, `${f.ruleId}: `), typographic(f.message))));
    this.caretNote.hidden = false;
    const id = shown[0]!.id;
    if (this.active !== id) {
      this.active = id;
      this.paint();
      for (const li of this.list.querySelectorAll<HTMLLIElement>(".finding")) li.classList.toggle("active", li.dataset["id"] === String(id));
    }
  }
}
