// Horizontal-overflow audit: every built page, every language, every width.
//
// CLAUDE.md specifies this check and names 1024 and 1100 as "the
// sidebar-transition widths where this class of bug lives, and the ones nobody
// tests by hand". It lived in /tmp for two runs and was re-derived each time;
// it belongs here.
//
//   npm run build
//   npx http-server dist -p 4319 --silent &
//   npm run audit:overflow -- http://127.0.0.1:4319
//
// Two things it must keep, both learned the hard way:
//
//  1. Disable animations AND scroll the page through before measuring. The
//     entrance animations are intersect-once, so an element sliding into place
//     is transiently outside the viewport and reads as overflow no user could
//     ever scroll to. Without both, two thirds of the output is noise.
//
//  2. Report the document's own scrollWidth, not "which element sticks out".
//     An element-blaming detector missed the /ru/ heading bug for two runs: the
//     h2's box is 288px wide and comfortably inside a 320px viewport, and only
//     its *text* overflowed. Nothing sticks out; the page is still 46px wide.
//     When something does overflow, bisect with scripts/overflow-bisect.mjs,
//     which hides subtrees until the page stops scrolling.
//
// Needs a browser. The system Chromium works and no Playwright download is
// required — set CHROMIUM to override.

const BASE = process.argv[2];

if (!BASE) {
  console.error('usage: node scripts/overflow-audit.mjs <base-url> [path ...]');
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error(
    'playwright is not installed. It is deliberately not a dependency of this\n' +
      'site — it is only needed for this audit. Install it somewhere and run:\n' +
      '  npm i playwright --prefix /tmp/overflow && \\\n' +
      '  NODE_PATH=/tmp/overflow/node_modules node scripts/overflow-audit.mjs <url>'
  );
  process.exit(2);
}

const WIDTHS = [320, 390, 768, 1024, 1100, 1440, 1920];

// Default to every page the build produced, so a new language or legal page is
// covered the day it is added rather than the day someone remembers to list it.
const { readdirSync } = await import('node:fs');
const discover = (dir, base = '') =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? discover(`${dir}/${e.name}`, `${base}/${e.name}`)
      : e.name === 'index.html'
        ? [`${base}/`]
        : []
  );

const PAGES = process.argv.length > 3 ? process.argv.slice(3) : discover('dist');

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
});

const findings = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  for (const path of PAGES) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 20000 });
    } catch {
      findings.push({ width, path, error: 'could not load' });
      continue;
    }

    // Belt and braces: reducedMotion only helps if the library honours it.
    await page.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important}',
    });

    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 20));
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(250);

    const over = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth - de.clientWidth;
    });

    if (over > 0) findings.push({ width, path, overflowPx: over });
  }

  await context.close();
}

await browser.close();

const loads = PAGES.length * WIDTHS.length;

if (findings.length === 0) {
  console.log(`clean: ${PAGES.length} pages x ${WIDTHS.length} widths = ${loads} loads, none overflowing`);
  process.exit(0);
}

console.error(`${findings.length} of ${loads} page loads scroll horizontally:`);
for (const f of findings) console.error(' ', JSON.stringify(f));
process.exit(1);
