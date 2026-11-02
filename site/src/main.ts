// The start of the page: the theme, the links, the playground, the explorer and the text of the sections.
import { marked } from "marked";
import install from "../content/install.md?raw";
import why from "../content/why.md?raw";
import { byId, copyText, h, setupNav, setupTheme } from "./chrome.ts";
import { Explorer } from "./explorer.ts";
import { decodeShare } from "./model.ts";
import { Playground } from "./playground.ts";
import { SAMPLES } from "./samples.ts";
import "./style.css";

/** This function writes the HTML of a Markdown file of the site in an article, with a copy button on each code block. */
function renderProse(article: HTMLElement, markdown: string, titleId: string): void {
  article.innerHTML = marked.parse(markdown, { async: false });
  article.querySelector("h2")?.setAttribute("id", titleId);
  for (const pre of article.querySelectorAll("pre")) {
    const button = h("button", { type: "button", class: "copy", "aria-label": "Copy the code" }, "Copy");
    button.addEventListener("click", () => void copyText(button, pre.querySelector("code")?.textContent ?? pre.textContent ?? ""));
    // The button is outside the scroll box of the code, so it stays in its corner when the code scrolls.
    const box = h("div", { class: "codeblock" });
    pre.replaceWith(box);
    box.append(pre, button);
  }
}

setupTheme(byId<HTMLButtonElement>("theme"));
setupNav(byId("links"));
renderProse(byId("why"), why, "why-title");
renderProse(byId("install"), install, "install-title");

const build = byId("build");
build.append(
  `Version ${__BUILD__.version}, build `,
  __BUILD__.sha === "local"
    ? "local"
    : h("a", { href: `https://github.com/mark1russell7/ste-lint/commit/${__BUILD__.sha}` }, __BUILD__.sha),
  ` of ${__BUILD__.date}`,
);

let explorer: Explorer | null = null;
const playground = new Playground({
  onExplain: (key) => explorer?.reveal(key),
  onCodeExtractor: (extractCode) => explorer?.setExtractCode(extractCode),
});
explorer = new Explorer((request) => {
  void playground.load(request, true);
  byId("playground").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});

const shared = decodeShare(location.search);
const first = SAMPLES[0]!;
void playground.load(shared ?? { text: first.text, mode: first.mode });
