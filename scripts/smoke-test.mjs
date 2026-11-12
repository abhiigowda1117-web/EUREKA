// Browser smoke test: loads every public page on a phone and a laptop viewport,
// fails on HTTP errors, console errors or horizontal overflow, and checks that
// private pages redirect to /login.
//
//   npm run build && npm start        (in one terminal)
//   npm run test:e2e                  (in another; BASE_URL defaults to http://localhost:3000)
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SCREENSHOT_DIR;

const publicPages = ["/", "/projects", "/login", "/signup", "/forgot-password", "/verify-email?email=a%40b.co", "/guidelines", "/terms", "/privacy", "/auth/error", "/does-not-exist"];
const privatePages = ["/dashboard", "/settings/profile", "/onboarding", "/projects/new", "/reset-password"];
const viewports = { phone: { width: 390, height: 844 }, laptop: { width: 1440, height: 900 } };

let failures = 0;
const fail = (msg) => { failures++; console.log(`  FAIL  ${msg}`); };
const pass = (msg) => console.log(`  PASS  ${msg}`);

const browser = await chromium.launch();
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

for (const [name, viewport] of Object.entries(viewports)) {
  console.log(`\n${name} (${viewport.width}px)`);
  const context = await browser.newContext({ viewport });
  for (const path of publicPages) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    const expected = path === "/does-not-exist" ? 404 : 200;
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const h1 = await page.locator("h1").count();
    const problems = [];
    if (res.status() !== expected) problems.push(`status ${res.status()} (expected ${expected})`);
    if (overflow > 1) problems.push(`horizontal overflow of ${overflow}px`);
    if (h1 !== 1) problems.push(`${h1} <h1> elements (expected 1)`);
    const realErrors = errors.filter((e) => !(expected === 404 && e.includes("404")));
    if (realErrors.length) problems.push(`console errors: ${realErrors.join(" | ")}`);
    problems.length ? fail(`${path}: ${problems.join("; ")}`) : pass(path);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}${path.replace(/[/?=%]/g, "_") || "_home"}.png`, fullPage: path === "/" });
    await page.close();
  }
  for (const path of privatePages) {
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    const url = new URL(page.url());
    url.pathname === "/login" && url.searchParams.get("next") === path
      ? pass(`${path} → /login?next=${path}`)
      : fail(`${path} should redirect to /login?next=${path}, got ${url.pathname}${url.search}`);
    await page.close();
  }
  await context.close();
}

// Interaction checks
const page = await browser.newPage({ viewport: viewports.phone });
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Open menu" }).click();
(await page.locator("#mobile-menu").isVisible()) ? pass("mobile menu opens") : fail("mobile menu did not open");
await page.keyboard.press("Escape");
(await page.locator("#mobile-menu").count()) === 0 ? pass("mobile menu closes on Escape") : fail("mobile menu did not close on Escape");
await page.getByRole("link", { name: "Explore Projects" }).first().click();
await page.waitForURL("**/projects");
pass("hero CTA 'Explore Projects' navigates to /projects");
await page.goto(BASE + "/#faq");
const faq = page.locator("#faq details").first();
await faq.locator("summary").click();
(await faq.getAttribute("open")) !== null ? pass("FAQ item expands") : fail("FAQ item did not expand");
await browser.close();

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll smoke checks passed.");
process.exit(failures ? 1 : 0);
