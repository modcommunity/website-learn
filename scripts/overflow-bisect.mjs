// Names the element responsible for one overflowing page load.
//
// Companion to scripts/overflow-audit.mjs, which tells you a page scrolls but
// not why. This hides one subtree at a time and keeps the deepest node whose
// removal alone stops the page scrolling.
//
// It exists because the obvious detector — "list every element whose right edge
// is past the viewport" — found nothing on /ru/ for two runs. The culprit was a
// heading whose box fitted perfectly and whose text did not, so no element
// stuck out and the page was still 46px too wide. Removal is the only test that
// does not need a theory of how the overflow is produced.
//
//   npm run audit:overflow:bisect -- http://127.0.0.1:4319 /ru/ 320

const [BASE, PATH = '/', WIDTH = '320'] = process.argv.slice(2);

if (!BASE) {
  console.error('usage: node scripts/overflow-bisect.mjs <base-url> [path] [width]');
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('playwright is not installed — see scripts/overflow-audit.mjs.');
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
});
const context = await browser.newContext({
  viewport: { width: Number(WIDTH), height: 900 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();

await page.goto(`${BASE}${PATH}`, { waitUntil: 'load' });
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
await page.waitForTimeout(300);

const result = await page.evaluate(() => {
  const de = document.documentElement;
  const client = de.clientWidth;
  const overflowPx = de.scrollWidth - client;
  const culprits = [];

  const walk = (el) => {
    const previous = el.style.display;
    el.style.display = 'none';
    const fixed = de.scrollWidth <= client;
    el.style.display = previous;

    if (!fixed) return false;

    // This subtree is responsible. Descend, and only report this node if no
    // child of it is responsible on its own.
    let deeper = false;
    for (const child of el.children) if (walk(child)) deeper = true;

    if (!deeper) {
      const box = el.getBoundingClientRect();
      culprits.push({
        tag: el.tagName.toLowerCase(),
        class: (el.getAttribute('class') || '').slice(0, 120),
        id: el.id || undefined,
        text: (el.textContent || '').trim().slice(0, 70),
        boxWidth: Math.round(box.width),
        // A contentWidth larger than boxWidth means the text overflows the
        // element rather than the element overflowing the page.
        contentWidth: el.scrollWidth,
      });
    }
    return true;
  };

  for (const child of document.body.children) walk(child);
  return { documentWidth: de.scrollWidth, viewport: client, overflowPx, culprits };
});

await browser.close();

console.log(JSON.stringify(result, null, 1));
process.exit(result.overflowPx > 0 ? 1 : 0);
