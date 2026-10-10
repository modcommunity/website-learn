# CLAUDE.md — website-learn

The Astro + React static site for The Modding Community's documentation: guides for using the site, every content item and its relations, the server scanner, the party system, the Godot addons, and the reference for the HTTP APIs. Production serves it at `docs.moddingcommunity.com/learn/…`. It is a sibling of `../website-processing` (the shell was copied from there on purpose) and sits beside `../website-city`, the app.

## Layout

| Path | What |
| --- | --- |
| `src/content/docs/<locale>/**.mdx` | The pages. `en` is the reference tree; other locales only overlay it |
| `src/content.config.ts` | The collection and its frontmatter schema, each field documented |
| `src/docs/tree.ts` | Builds the navigation from `en`, swapping in translated titles |
| `src/pages/learn/[...slug].astro`, `src/pages/[lang]/learn/[...slug].astro` | The routes; no Astro `base` |
| `src/pages/learn/search/[locale].json.ts`, `sitemap.xml.ts`, `404.astro` | Per-locale search index, the docs sitemap, the 404 |
| `src/layouts/DocsLayout.astro` | The three columns inside `Layout.astro`'s `<main>` |
| `src/components/docs/` | `mdx.tsx` (the MDX component set), `DocsNav`, `DocsSearch`, `DocsToc`, `Pager` |
| `src/lib/search.ts` | The pure search scorer, tested by `search.test.ts` |
| `src/i18n/` | Shell strings (`sections/docsUi.ts`), `nav.tsx`, `link.tsx` (applies `PUBLIC_MAIN_URL`) |
| `src/styles/components/Docs.css` | Docs shell and prose styles, Shiki colours |
| `scripts/docs-lint.mjs`, `overflow-audit.mjs` | Link/anchor/NUL check; horizontal-overflow audit |
| `Dockerfile`, `docker/nginx.conf.template` | The deploy image and its nginx |

## Run and test

- `npm run dev`: dev server. `npm run build`: `astro check && astro build`; renders every page and fails on a broken import, a bad frontmatter schema or malformed MDX.
- `npm test`: vitest over `src/lib/` (search scorer, analytics). The only check of behaviour rather than compilation.
- `npm run docs:check`: internal link and anchor check, plus the NUL-byte check. The build will not catch a broken link; run it after every editing pass.
- `npm run audit:overflow`: with `dist/` served; needs Playwright, which is deliberately not a dependency ([docs/layout.md](docs/layout.md#the-check-to-run)).
- `npm run shared:local` / `shared:registry` / `shared:status` / `shared:build`: which `@modcommunity/shared` you build against.
- `npm run preview` needs the node adapter (commented out); use `dev`, or serve `dist/`.

## Rules

- Never add `base: '/learn'`: it would put the locale inside the prefix and break the shared language picker. `/learn` is a real route directory. ([deployment](docs/deployment.md#no-base-learn))
- Keep `build.assets: 'learn/_astro'`, or this build's assets collide with website-processing's `/_astro/`. ([deployment](docs/deployment.md#assets-live-under-learn_astro))
- `PUBLIC_URL` is this build's own origin; `PUBLIC_MAIN_URL` is where the shell's bare-path links go. Do not confuse them. ([deployment](docs/deployment.md#on-its-own-origin-public_main_url-not-public_url))
- `search` is a reserved first path segment under `/learn`. ([deployment](docs/deployment.md#sitemap-and-reserved-paths))
- English is the reference tree: a locale only overlays pages and never adds one; an untranslated page renders English behind a notice. ([authoring](docs/authoring.md#content-lives-in-mdx-not-in-typescript))
- Page prose is MDX, not TypeScript strings; only the shell's strings live in `src/i18n/sections/`. ([authoring](docs/authoring.md))
- Do not import the MDX components in a page; they are in scope. `<Param required>` is tri-state. ([authoring](docs/authoring.md#components-available-in-mdx))
- Quote numeric `keywords`; put synonyms there, not title words. ([search](docs/search.md#keywords))
- `hidden` and `badge: draft` keep a page out of the nav, search and sitemap but it still builds. ([authoring](docs/authoring.md#frontmatter))
- The Shiki wrapper class is `.astro-code`, not `.shiki`. ([authoring](docs/authoring.md#code-blocks))
- Say why, name the trap, do not quote a number that drifts, cross-link and run `docs:check`. ([authoring](docs/authoring.md#writing-style))
- Container queries, not `sm:`/`md:`/`lg:` (except for `fixed` elements outside `<main>`); squeezable items get `min-w-0`. ([layout](docs/layout.md))
- `.docs-shell > astro-island` stays `display: contents`, and overlays are portalled to `<body>`. ([layout](docs/layout.md#the-three-columns))
- The search scorer stays pure in `src/lib/search.ts`; `mark()` matches the original text and escapes afterwards. ([search](docs/search.md))
- When you change shell behaviour here, check whether website-processing needs the same change. ([shell](docs/shell.md))
- The chrome must match website-city except the Docs leaf, which points at `/learn`; `check-layout-sync.sh` checks it. ([shell](docs/shell.md#one-deliberate-divergence-from-citys-nav))
- Icons are `lucide-react` (colour with `text-*`), `react-icons/fa6` only for brand marks. Re-run `shared:local` after any `npm install`. ([shell](docs/shell.md#dependencies))
- Third-party source cloned to be read lives in `/extra/external/` (see its README): look there before designing something from scratch; never a dependency.

## Read before

| Read | Before |
| --- | --- |
| [docs/README.md](docs/README.md) | Anything not covered above: the index |
| [docs/authoring.md](docs/authoring.md) | Writing or editing a page: MDX, frontmatter, components, code blocks, style, link checking |
| [docs/deployment.md](docs/deployment.md) | Touching `astro.config.mjs`, routes, nginx, env origins, the sitemap |
| [docs/layout.md](docs/layout.md) | Any layout change: the three columns, container queries, the overflow audit |
| [docs/search.md](docs/search.md) | Touching search, its index, scorer or keywords |
| [docs/shell.md](docs/shell.md) | Changing the shared shell, dependencies, or the nav |
| [docs/history.md](docs/history.md) | Wondering why a rule exists |
