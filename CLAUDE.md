# CLAUDE.md — website-learn

Guidance for working in this repository. It is specific to `website-learn` and
is separate from `../website-processing/CLAUDE.md` and
`../website-city/CLAUDE.md`.

## What this repo is

`website-learn` is the **Astro + React** static site for The Modding Community's
**documentation** — guides for using the site, an explanation of every content
item and its relations, the server scanner, the party system, and the reference
for all three HTTP APIs.

It is the third site on the same domain:

| Repo | Serves | Stack |
| --- | --- | --- |
| `../website-city` | The app itself — everything at `/mods`, `/servers`, `/account`, … | Next.js |
| `../website-processing` | The landing page and the legal pages | Astro |
| **this** | `/learn` — the documentation | Astro |

It is a **sibling of `website-processing`, not a fork**: the shell (header, icon
rail, footer, language picker, theme toggle, analytics, fonts, styles, i18n
machinery) was copied from it deliberately so the three sites are visually and
behaviourally identical. **When you change shell behaviour here, check whether
website-processing needs the same change.**

## Where it is mounted, and why there is no `base`

The docs live at `/learn` on the main domain:

```
https://moddingcommunity.com/learn
https://moddingcommunity.com/learn/api/content/authentication
https://moddingcommunity.com/es/learn/api/content/authentication
```

**Do not add `base: '/learn'` to `astro.config.mjs`.** `base` is a single static
prefix and would put the locale *inside* it — `/learn/es/api` — while
website-city and website-processing both serve `/es/...`. A reader who switches
language in the shared header has to land on the same shape of URL on all three
builds, or the picker sends them to a 404.

So `/learn` is a real route directory instead:

```
src/pages/learn/[...slug].astro          ->  /learn/**              (English)
src/pages/[lang]/learn/[...slug].astro   ->  /{es,fr,…}/learn/**    (the other 8)
```

nginx routes both `^/learn` and `^/(es|fr|de|ru|nl|ja|zh|pt)/learn` here, and
serves this build's own 404 for unmatched paths under them:

```nginx
error_page 404 /learn/404/index.html;
```

Note the path: Astro's **directory** output builds `src/pages/learn/404.astro`
to `dist/learn/404/index.html`, not `404.html`. Every URL on this site carries a
trailing slash and the canonical, hreflang and sitemap URLs all assume it, so
the format is not worth changing for one page.

Those two prefixes cover the **whole** build, and that is what
`build.assets: 'learn/_astro'` in `astro.config.mjs` is for. Astro's default
puts hashed CSS/JS/fonts at `/_astro/`, outside both of them — and
website-processing is also an Astro build on this domain emitting the same
prefix, which the host sends to *its* container. The result is a doc page whose
HTML serves fine while its stylesheet and every island 404s. Under `/learn` the
two builds cannot collide, and adding a page never needs an nginx change.

`public/` is the deliberate exception: `favicon.ico` and `images/` stay at the
root because they are byte-identical to website-processing's copies and are
already served from there.

### If the docs get their own origin

The above describes the `/learn`-on-the-main-domain deployment. On a separate
host (`docs.moddingcommunity.com`) one more thing has to be said out loud,
because nothing about it is visible until a reader clicks: **the shell's links
are bare paths.** `nav.tsx` holds `/mods`, not an absolute URL, so the shared
Header can match them against `activePath` — and a bare path resolves against
whatever host served the page. On its own origin every entry in the header
points at a page the docs host does not have.

`PUBLIC_MAIN_URL` is the fix, applied at render time in `i18n/link.tsx` (and in
the three places that hand-roll an anchor: `AccountButton`, `SiteSidebar`'s
share card, and the `a` in `components/docs/mdx.tsx` for prose links). Unset it
and every link goes back to being relative, so a main-domain deploy costs
nothing.

**`PUBLIC_URL` is not that variable** and setting it instead is the natural
mistake: it is this build's OWN origin — canonical, hreflang, Open Graph and
the sitemap — so on a subdomain it is the *docs* host, not the main site.

One thing outside this repo: website-city's `AUTH_COOKIE_DOMAIN` must be set to
the shared parent domain, or the `tmc_auth` hint cookie stays host-only, and
`lib/auth-hint.ts` sees a signed-in reader as signed out.

The docs also publish their own sitemap at `/learn/sitemap.xml` — scoped there
because website-processing owns `/robots.txt` and `/sitemap.xml` at the domain
root. Reference it from that repo's robots.txt:

```
Sitemap: https://moddingcommunity.com/learn/sitemap.xml
```

`src/pages/learn/search/[locale].json.ts` also lives under that prefix, which
makes **`search` a reserved first path segment**: a doc page at `search/anything`
would collide with the search index endpoint.

## How a documentation page works

### Content lives in MDX, not in TypeScript

```
src/content/docs/en/api/content/authentication.mdx   ->  /learn/api/content/authentication
src/content/docs/es/api/content/authentication.mdx   ->  /es/learn/api/content/authentication
```

The collection is defined in `src/content.config.ts`. **English is the reference
tree**: `src/docs/tree.ts` builds the navigation from the `en` entries alone and
swaps in a translated title wherever a locale has the file. A locale can only
*overlay* pages; it can never contribute one of its own, because a route that
exists in one language and 404s in the other eight would break the language
picker on exactly the page a reader reached for it on.

A locale with no translation for a page still gets the route — it renders the
English body behind a notice (`docs.fallback`). That is the same per-key
fallback `src/i18n/t.ts` gives the shell strings, applied at page granularity.

This is deliberately **not** the `src/i18n/sections/*.ts` pattern
website-processing uses for its landing copy. Authoring 1,300 lines of API prose
as TypeScript string literals is miserable, and the shell strings — which *are*
in that format, in `src/i18n/sections/docsUi.ts` — are the ~25 that need it.

### Frontmatter

`title` and `description` are required; everything else has a default. See the
schema in `src/content.config.ts`, which documents each field and why it exists.
Worth knowing:

- **`order`** sorts within a folder. Ties break by title, so a folder can leave
  it off entirely and still be stable — but watch for accidental interleaving
  when a folder mixes concept pages and sub-section indexes (that is why
  `api/content`, `api/integration` and `api/app` carry 40 / 50 / 60 rather than
  10 / 20 / 30).
- **`navTitle`** shortens the sidebar label. The rail is 16.5rem; anything over
  about 24 characters truncates.
- **`source`** is a maintenance note listing the files in `../website-city` the
  page was written against. It is never rendered. When you change something in
  city, `grep` this repo for the path.
- **`keywords`** feeds search only — see below. `hidden` and `badge: draft` keep
  a page out of the nav and/or the index, and now also out of `sitemap.xml`:
  the sitemap builds from `indexableDocPaths()`, not `allDocPaths()`, so it no
  longer submits to Google, in nine languages, the pages those two flags exist
  to withhold. Both still *build* — a hidden deep-link has to stay reachable
  from the prose that links it.

### Components available in MDX

Handed to every page by `src/components/docs/mdx.tsx` — **do not import them in
the MDX file**, they are already in scope:

`<Callout>` `<Endpoint>` `<Params>` / `<Param>` `<Cards>` / `<Card>` `<Scopes>`
`<Related>` `<Badge>`

The set is deliberately small. Anything expressible as Markdown stays Markdown;
a component earns its place only when the docs need to be *consistent* about
something — the shape of an endpoint, the meaning of a tone, what a required
parameter looks like.

Two behaviours that are easy to trip over:

- **`<Param required>` is tri-state.** `true` renders REQUIRED, `false` renders
  OPTIONAL, and **omitting it renders neither** — because `<Params>` doubles as
  a labelled-block layout for things that are not parameters at all.
- **A `<Param name>` with a space in it is set in the body font, not mono.** A
  name with a space is prose ("The party queue"); one without is an identifier.

### The three columns

`src/layouts/DocsLayout.astro` renders the docs rail, the article and the
"on this page" rail inside `Layout.astro`'s `<main>`.

Two things there are load-bearing and will look like noise if you do not know
why:

1. **`.docs-shell` is `flex-wrap`, and `.docs-shell > astro-island` is
   `display: contents`** (see `src/styles/components/Docs.css`). `<DocsNav/>` is
   one island holding two differently-placed elements — the wide-viewport rail
   (a column beside the article) and the narrow-viewport trigger bar (a strip
   above it). Astro wraps an island's output in a single `<astro-island>`
   element, so without those two rules the trigger bar becomes a flex item
   competing with the article: at 390px it squeezed the article column to zero
   and pushed the page 258px wide.

2. **The drawer and the search dialog are `createPortal`'d to `<body>`.**
   `Layout.astro` gives `<main>` `relative z-20`, which makes it a stacking
   context, so a `fixed` overlay rendered inside it is trapped there whatever
   z-index it asks for — and the shared `<Header/>` is `z-40` on the outside.
   Rendering in place painted the site nav over the drawer's own close button.

## Responsive layout — same rules as website-processing

**Container queries, not `sm:`/`md:`/`lg:`.** `Layout.astro` marks `<main>` as
`@container` and `DocsLayout.astro` opens a second one on the article column.
The viewport variants are actively wrong here: the shared icon rail takes 4rem
(16rem pinned) and the docs rail takes another 16.5rem, so a viewport breakpoint
fires when the space available to lay out in has just *dropped*.

Rough conversion: `md:` → `@3xl:`, `lg:` → `@4xl:`, `xl:` → `@5xl:`.

Anything that can be squeezed wants `min-w-0`. A grid or flex item's automatic
minimum size is its content's — see the 320px trigger-bar bug documented inline
in `DocsNav.tsx`, which is exactly that.

### The check to run

```bash
npm run build
npx http-server dist -p 4477 --silent &
# then measure documentElement.scrollWidth against clientWidth at
# 320 / 390 / 768 / 1024 / 1100 / 1440 / 1920 on every page
```

`scripts/overflow-audit.mjs` (`npm run audit:overflow`) does this — it needs
Playwright, which is deliberately not a dependency; `../website-city` has one
installed. 1024 and 1100 are the sidebar-transition widths where this class of
bug lives, and they are the ones nobody tests by hand.

## Link checking

```bash
npm run docs:check
```

`scripts/docs-lint.mjs` resolves every internal `/learn/...` link — including
`#anchor` fragments — against the pages that actually exist, warns about pages
nothing links to from prose, and fails on a stray NUL byte in any source file.

**The build cannot catch this**: a link to
`/learn/content/relations/permission` (singular) is valid Markdown pointing at a
404, and in a corpus this heavily cross-linked it is the mistake that actually
happens. Run it after any editing pass.

## Search

There is no search server. `src/pages/learn/search/[locale].json.ts` emits one
index per locale at build time, and `DocsSearch.tsx` fetches and scores it in
the browser — **on the first keystroke, not at page load**, so a reader who never
searches pays nothing for it.

Per locale rather than one combined file: a reader only ever searches their own
language, and bundling all nine would make every visitor download eight indexes
they will never query.

The scorer itself lives in **`src/lib/search.ts`**, not in the component:
`search`, `snippetFor`, `mark`, `countOf` and `toPlainText` are pure functions
with no React and no DOM, and `src/lib/search.test.ts` covers them. The
component owns the dialog, the fetch and the keyboard handling; the endpoint
imports `toPlainText` from the same file, so what goes into the index and what
scores it cannot drift apart.

`mark()` matches against the **original** text and escapes the pieces
afterwards. Do not "simplify" it back to escaping first and matching the
result: the escaped form contains `&amp;`, `&lt;` and `&quot;`, so a reader
searching for `&` got a half-marked entity and a search for `amp` or `lt`
highlighted the inside of entities that are nowhere in the prose.

Scoring is AND across query terms, weighted by *where* a term matched (title ≫
keywords ≫ heading ≫ description ≫ body), with diminishing returns on body
frequency. Code fences are stripped from the index — every API page contains
`curl` and `Authorization`, so matching on them is noise. Draft pages are
excluded, and so are `hidden` ones (they never enter the tree the index is
built from).

**Frontmatter `keywords` is how you catch the word a reader actually types.**
It sits second in that order because it is the only signal in the index that is
deliberate rather than derived — the author saying "people look for this page
under *2FA*, and the page only ever says *two-factor authentication*". Put the
synonym, the abbreviation, the status code, the old name; do not repeat words
already in the title, which score higher anyway. The index takes the **union**
of the translated file's keywords and English's, because identifiers
(`apiPublic`, an endpoint path) do not translate and a Spanish reader still
searches for them by name.

One trap that cost a build: YAML parses a bare `429` as a number and the schema
wants strings. **Quote numeric keywords.**

## Writing style

The existing pages set the bar; match it.

- **Say why, not just what.** The reason `apiPublic` is a switch is more useful
  than the fact that it exists. Most of that reasoning already exists in
  `../website-city`'s Prisma doc comments and in `docs/api/*.md` — read them
  before writing, and distil rather than invent.
- **Name the trap.** Where two things are confusable — `hidden` vs `archived`,
  usage policy vs access grants, `matchEmptyOnly` vs `matchPreferEmpty`,
  `wasOnline` vs "has ever been online" — say so explicitly in a `<Callout>`.
- **Do not quote a number that will drift.** Where a limit is
  operator-configurable, say it is and name the setting.
- **Cross-link generously**, and run `npm run docs:check` afterwards.

## Dependencies

Identical to website-processing, plus `@astrojs/mdx` and
`@fontsource-variable/jetbrains-mono`; minus `react-multi-carousel` and
`react-type-animation`, which nothing here uses.

- **`@modcommunity/shared` has two sources** — the published package
  (`^4.3.0`, what `npm ci` gets) and the local checkout at
  `../tmc-global/shared`. Switch with `npm run shared:local` /
  `shared:registry`; check with `shared:status`. Both use `--no-save`, so
  switching never shows up in `git status`. **A plain `npm install` restores the
  registry version, so re-run `npm run shared:local` after one.**
- A shared change is not live here until it is published (registry mode) or
  linked and rebuilt with `npm run shared:build` (local mode).
- **In local mode the two repos must be on matching branches.** The symptom of a
  mismatch is `"X" is not exported by ".../shared"` for a component that plainly
  exists.
- `astro.config.mjs` sets `optimizeDeps.exclude: ['@modcommunity/shared']`, so
  `shared:build` is safe to run with the dev server up and no cache flush is
  needed.
- **Icons: `lucide-react` is the house set.** `react-icons` is only for brand
  marks (Discord, X, GitHub, Steam, Facebook, from `react-icons/fa6`). lucide
  icons are stroke-based — colour them with `text-*`, never `fill-*`.

## Syntax highlighting

Shiki, dual-theme, configured in `astro.config.mjs` with `defaultColor: false`.
Both palettes are emitted as CSS variables on every token and
`src/styles/components/Docs.css` picks which applies off the same `.dark` class
the shared `<ThemeToggle/>` writes.

**The wrapper class is `.astro-code`, not `.shiki`.** Astro renames it, and a
`.shiki` selector matches nothing — which fails silently as unhighlighted code
in the inherited prose colour, readable enough to be easy to miss.

Only the foreground comes from Shiki. The background stays the theme's own
surface, because `github-light`'s `#fff` and `github-dark-default`'s `#0d1117`
would put a differently-coloured slab in the middle of every page.

## One deliberate divergence from city's nav

`src/i18n/nav.tsx` adds a **Documentation** entry to the header's Resources menu
and to the footer's Resources column, pointing at `/learn`. website-city and
website-processing do not have it yet.

A docs site whose own header offers no way back to the docs is absurd, so it is
on purpose. When city adds it, the three configs match again. That is the one
place the three navs differ.

## Build / dev

- `npm run dev` — Astro dev server.
- `npm run build` — `astro check && astro build`. This is the check to run after
  changes: it renders all 585 pages and fails on a broken import, a bad
  frontmatter schema or malformed MDX.
- `npm test` — vitest, over the search scorer in `src/lib/`. Fast (no DOM, no
  build) and the only thing here that checks behaviour rather than compilation.
- `npm run docs:check` — internal link and anchor check. Run it too; the build
  will not catch a broken link. It also fails on a **NUL byte** anywhere in
  source: one had got into `DocsSearch.tsx` and made the file test as binary, so
  `grep` skipped it silently and several greps came back wrongly empty.
- `npm run preview` — needs the node adapter (commented out in
  `astro.config.mjs`); prefer `dev`, or serve `dist/` with `http-server`.

---

## External source code

`~/stack/external-study/` holds third-party source cloned **to be read** — Godot, the
Source engine, Momentum Mod, Shavit's `bhoptimer`, and the mod managers. Read-only,
never a dependency, never imported. Look there before designing something from
scratch; see [`external-study/README.md`](../external-study/README.md).
