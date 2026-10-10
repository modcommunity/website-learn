# Layout: the three columns and container queries

## The three columns

`src/layouts/DocsLayout.astro` renders the docs rail, the article and the "on this page" rail inside `Layout.astro`'s `<main>`. Two things there are load-bearing and look like noise if you do not know why:

1. **`.docs-shell` is `flex-wrap`, and `.docs-shell > astro-island` is `display: contents`** (`src/styles/components/Docs.css`). `<DocsNav/>` is one island holding two differently placed elements: the wide-viewport rail (a column beside the article) and the narrow-viewport trigger bar (a strip above it). Astro wraps an island's output in a single `<astro-island>` element, so without those two rules the trigger bar becomes a flex item competing with the article; at 390px it squeezed the article column to zero and pushed the page 258px wide.
2. **The drawer and the search dialog are `createPortal`'d to `<body>`.** `Layout.astro` gives `<main>` `relative z-20`, which makes it a stacking context, so a `fixed` overlay rendered inside it is trapped there whatever z-index it asks for, and the shared `<Header/>` is `z-40` outside it. Rendering in place painted the site nav over the drawer's own close button.

## Container queries, not `sm:`/`md:`/`lg:`

The same rule as website-processing ([its layout doc](../../website-processing/docs/layout.md)). `Layout.astro` marks `<main>` as `@container` and `DocsLayout.astro` opens a second one on the article column. Viewport variants are wrong here: the shared icon rail takes 4rem (16rem pinned) and the docs rail another 16.5rem, so a viewport breakpoint fires when the space available has just dropped.

- Rough conversion: `md:` → `@3xl:`, `lg:` → `@4xl:`, `xl:` → `@5xl:`.
- Anything that can be squeezed wants `min-w-0`. A grid or flex item's automatic minimum size is its content's; the 320px trigger-bar bug documented inline in `DocsNav.tsx` is exactly that.
- The exception is anything `fixed` outside `<main>` (`CornerLauncher.tsx`), where the viewport is the right thing to measure.

## The check to run

`npm run build`, serve `dist/` (for example `npx http-server dist -p 4477 --silent`), then `npm run audit:overflow` (`scripts/overflow-audit.mjs`), which measures `documentElement.scrollWidth` against `clientWidth` at 320 / 390 / 768 / 1024 / 1100 / 1440 / 1920 on every page. It needs Playwright, which is deliberately not a dependency here; `../website-city` has one installed. 1024 and 1100 are the sidebar-transition widths where this class of bug lives, and the ones nobody tests by hand.
