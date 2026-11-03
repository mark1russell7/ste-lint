// The rules explorer: each rule and each entry of the word list, with a search, filters and the examples.
import { DEFAULT_WORD_LIST, type CodeExtractor } from "@mark1russell7/ste-lint/core";
import { buildCatalog, filterCatalog, NO_FILTER, type CatalogFilter, type CatalogItem } from "./catalog.ts";
import { byId, h, Segmented } from "./chrome.ts";
import type { Example } from "./examples.ts";
import { lintExample } from "./lint.ts";
import { segments, SPAN_RULES, typographic, viewFindings } from "./model.ts";
import type { LoadRequest } from "./playground.ts";

/** The ID of the element of an item, for the links of the page. */
export const itemElementId = (key: string): string => key.replace(":", "-").replace(/[^A-Za-z0-9_-]+/g, "_");

/** The rows of the word list that show before "Show all", when no filter is set. */
const WORD_ROWS = 12;

export class Explorer {
  private readonly items = buildCatalog();
  private readonly catalog = byId("catalog");
  private readonly search = byId<HTMLInputElement>("rule-search");
  private readonly count = byId("rules-count");
  private readonly kind: Segmented<CatalogFilter["kind"]>;
  private readonly severity: Segmented<CatalogFilter["severity"]>;
  private filter: CatalogFilter = NO_FILTER;
  private extractCode: CodeExtractor | null = null;
  private timer = 0;
  /** With no filter, the word list shows its first rows only, until the user asks for all. */
  private allWords = false;

  constructor(private readonly onTry: (request: LoadRequest) => void) {
    this.kind = new Segmented(
      byId("kind-filter"),
      [
        { value: "all", label: "All" },
        { value: "rule", label: "Rules" },
        { value: "word", label: "Word list" },
      ],
      "all",
      (kind) => this.update({ ...this.filter, kind }),
    );
    this.severity = new Segmented(
      byId("severity-filter"),
      [
        { value: "all", label: "Any severity" },
        { value: "error", label: "Errors" },
        { value: "warning", label: "Warnings" },
      ],
      "all",
      (severity) => this.update({ ...this.filter, severity }),
    );
    this.search.addEventListener("input", () => {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.update({ ...this.filter, query: this.search.value }), 80);
    });
    this.render();
  }

  /** The doc comment examples get their marks when the TypeScript parser is loaded. */
  setExtractCode(extractCode: CodeExtractor): void {
    this.extractCode = extractCode;
    this.render();
  }

  /** This function clears the filters, shows the item and moves the focus to it. */
  reveal(key: string): void {
    this.search.value = "";
    this.kind.set("all");
    this.severity.set("all");
    this.allWords = true;
    this.update(NO_FILTER);
    const el = document.getElementById(itemElementId(key));
    if (el === null) return;
    el.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
    el.focus({ preventScroll: true });
  }

  private update(filter: CatalogFilter): void {
    this.filter = filter;
    this.render();
  }

  private render(): void {
    const shown = filterCatalog(this.items, this.filter);
    const rules = shown.filter((i) => i.kind === "rule");
    const words = shown.filter((i) => i.kind === "word");
    const ruleTotal = this.items.filter((i) => i.kind === "rule").length;
    const wordTotal = this.items.length - ruleTotal;
    this.count.textContent =
      shown.length === this.items.length
        ? `${ruleTotal} rules and ${wordTotal} entries of the word list.`
        : `${shown.length} of ${this.items.length} items agree with the filters.`;
    const parts: HTMLElement[] = [];
    if (rules.length > 0) parts.push(h("h3", {}, `Rules (${rules.length})`), h("div", { class: "rule-grid" }, rules.map((i) => this.ruleCard(i))));
    if (words.length > 0) {
      const filtered = this.filter.query.trim() !== "" || this.filter.kind !== "all" || this.filter.severity !== "all";
      const cut = filtered || this.allWords ? words.length : Math.min(words.length, WORD_ROWS);
      const rows = words.slice(0, cut).map((i) => this.wordRow(i));
      if (cut < words.length) {
        const more = h("button", { type: "button" }, `Show all ${words.length} entries`);
        more.addEventListener("click", () => {
          this.allWords = true;
          this.render();
          this.catalog.querySelectorAll<HTMLElement>(".word-row")[cut]?.focus();
        });
        rows.push(h("li", { class: "word-more" }, more));
      }
      parts.push(
        h("h3", {}, `Word list (${words.length})`),
        h("p", { class: "hint" }, "The rule word-list finds these words and phrases. Each row tells the words to write."),
        h("ul", { class: "card word-list" }, rows),
      );
    }
    if (parts.length === 0) parts.push(h("p", { class: "card no-match" }, "No rule or entry agrees with the filters."));
    this.catalog.replaceChildren(...parts);
  }

  private ruleCard(item: CatalogItem): HTMLElement {
    return h(
      "article",
      { class: "card rule-card", id: itemElementId(item.key), tabindex: -1, "aria-labelledby": `${itemElementId(item.key)}-t` },
      h(
        "header",
        {},
        h("h4", { id: `${itemElementId(item.key)}-t` }, item.title),
        h("span", { class: `badge ${item.severity}` }, item.severity),
        h("span", { class: "ste" }, `STE ${item.ste}`),
      ),
      h("p", { class: "desc" }, typographic(item.description)),
      item.ruleId === "unknown-word" && h("p", { class: "hint" }, "This rule needs a dictionary. The example uses a small list of made-up words."),
      this.examples(item),
      this.tryButton(item),
    );
  }

  private wordRow(item: CatalogItem): HTMLElement {
    const entry = DEFAULT_WORD_LIST.find((e) => e.id === item.id);
    return h(
      "li",
      { class: "word-row", id: itemElementId(item.key), tabindex: -1 },
      h("span", { class: "words" }, item.match.join(", "), h("span", { class: `badge ${item.severity}` }, item.severity)),
      h(
        "span",
        { class: "write" },
        item.suggest === null ? "Remove the word." : typographic(`Write ${item.suggest}.`),
        entry?.note !== undefined && h("span", { class: "note" }, entry.note),
      ),
      this.examples(item),
      this.tryButton(item),
    );
  }

  private examples(item: CatalogItem): HTMLElement | null {
    const ex = item.example;
    if (ex === null) return null;
    const code = ex.mode === "doc";
    return h(
      "div",
      { class: "ex" },
      h("p", { class: "bad" }, h("span", { class: "tag" }, "Bad"), h("span", { class: `txt${code ? " code" : ""}` }, this.marked(item, ex))),
      h("p", { class: "good" }, h("span", { class: "tag" }, "Good"), h("span", { class: `txt${code ? " code" : ""}` }, ex.good)),
    );
  }

  /** The bad example, with a mark on each finding of the rule or the entry of the item. */
  private marked(item: CatalogItem, ex: Example): Node[] {
    if (ex.mode === "doc" && this.extractCode === null) return [document.createTextNode(ex.bad)];
    const findings = viewFindings(ex.bad, lintExample(ex, "bad", this.extractCode ?? undefined), DEFAULT_WORD_LIST).filter(
      (f) => f.ruleId === item.ruleId && (item.kind === "rule" || f.entryId === item.id),
    );
    return segments(ex.bad, findings).map((part) => {
      const text = ex.bad.slice(part.start, part.end);
      if (part.severity === null) return document.createTextNode(text);
      const cls = SPAN_RULES.has(item.ruleId) ? "long" : part.severity;
      return h("mark", { class: cls }, text);
    });
  }

  private tryButton(item: CatalogItem): HTMLButtonElement | null {
    const ex = item.example;
    if (ex === null) return null;
    const button = h("button", { type: "button", class: "try", "aria-label": `Try the bad example of ${item.title} in the playground` }, "Try in the playground");
    button.addEventListener("click", () =>
      this.onTry({ text: ex.bad, mode: ex.mode ?? "markdown", ...(ex.dictionary === undefined ? {} : { dictionary: { words: ex.dictionary, source: "example words" } }) }),
    );
    return button;
  }
}
