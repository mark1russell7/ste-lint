// The probe of the playground. The site check of the Pages workflow runs it in a browser, at each width,
// before the deploy (site-check-probe in .github/workflows/pages.yml). A failed check stops the deploy.
// The helpers check, until, $, $$, type and click come from the site check (the README of site-pages).

const findings = () => $$("#findings li.finding");
const rules = () => findings().map((li) => li.querySelector(".rule-id")?.textContent ?? "");

check("the sample text gives findings", await until(() => findings().length > 0), `${findings().length} findings`);

const labels = $$("#findings li.finding .fixes button").map((button) => button.textContent ?? "");
check("the fix buttons show no straight quotes", labels.length > 0 && labels.every((label) => !label.includes('"')), labels.slice(0, 3).join(", "));

type("#editor", "You should restart the server.");
check("a new text gives the modal-verb finding", await until(() => rules().includes("modal-verb")), rules().join(", "));

const message = $("#findings li.finding .msg")?.textContent ?? "";
check("a message shows an opening and a closing quote", message.includes("“") && message.includes("”") && !message.includes('"'), message);

type("#editor", "Restart the server.");
check("an STE text gives no findings", await until(() => findings().length === 0 && $("#findings li.empty") !== null), rules().join(", "));

check("the rules explorer shows the rule cards", $$("#catalog .rule-card").length >= 10, `${$$("#catalog .rule-card").length} cards`);
