/**
 * Captures the design-preview routes at the breakpoints in the brief so the
 * composition can be reviewed without a live account.
 *
 *   node scripts/screenshots.mjs [baseUrl]
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3001";
const out = "screenshots";

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "1024", width: 1024, height: 900 },
  { name: "768", width: 768, height: 1000 },
  { name: "375", width: 375, height: 812 },
  { name: "320", width: 320, height: 720 },
];

const PAGES = [
  { name: "today", path: "/preview" },
  { name: "programs", path: "/preview/programs" },
  { name: "biomarkers", path: "/preview/biomarkers" },
  { name: "plan", path: "/preview/plan" },
  { name: "weekly", path: "/preview/weekly" },
  { name: "learn", path: "/preview/learn" },
  { name: "states", path: "/preview/states" },
  { name: "sign-in", path: "/sign-in" },
];

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

async function shoot(
  browser,
  { viewport, path, name, dark = false, expand = false, menu = false },
) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    colorScheme: dark ? "dark" : "light",
  });
  const page = await context.newPage();
  await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
  await settle(page);

  if (expand) {
    await page.locator("main li button[aria-expanded]").first().click();
    await page.waitForTimeout(400);
  }

  if (menu) {
    await page.getByRole("button", { name: /menu/i }).first().click();
    await page.waitForTimeout(400);
  }

  const suffix = [
    name,
    viewport.name,
    dark ? "dark" : null,
    expand ? "expanded" : null,
    menu ? "menu" : null,
  ]
    .filter(Boolean)
    .join("-");
  // The menu is a fixed overlay, so a full-page shot would scroll past it.
  await page.screenshot({ path: `${out}/${suffix}.png`, fullPage: !menu });
  await context.close();
  return suffix;
}

const browser = await chromium.launch();
await mkdir(out, { recursive: true });

const shots = [];
if (!process.env.ONLY_EXTRAS) {
  for (const entry of PAGES) {
    for (const viewport of VIEWPORTS) {
      shots.push({ viewport, ...entry });
    }
  }
}
shots.push({
  viewport: VIEWPORTS[0],
  name: "biomarkers",
  path: "/preview/biomarkers",
  expand: true,
});
shots.push({ viewport: VIEWPORTS[0], name: "today", path: "/preview", dark: true });
shots.push({
  viewport: VIEWPORTS[0],
  name: "programs",
  path: "/preview/programs",
  dark: true,
});
shots.push({ viewport: VIEWPORTS[3], name: "today", path: "/preview", dark: true });
shots.push({
  viewport: VIEWPORTS[3],
  name: "biomarkers",
  path: "/preview/biomarkers",
  expand: true,
});
shots.push({ viewport: VIEWPORTS[3], name: "today", path: "/preview", menu: true });

for (const shot of shots) {
  const file = await shoot(browser, shot);
  console.log(`captured ${file}`);
}

await browser.close();
