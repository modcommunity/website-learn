# Authoring: content, frontmatter, MDX components, style

## Content lives in MDX, not in TypeScript

```
src/content/docs/en/api/content/authentication.mdx   ->  /learn/api/content/authentication
src/content/docs/es/api/content/authentication.mdx   ->  /es/learn/api/content/authentication
```

The collection is defined in `src/content.config.ts`. **English is the reference tree**: `src/docs/tree.ts` builds the navigation from the `en` entries alone and swaps in a translated title wherever a locale has the file. A locale can only overlay pages, never contribute one of its own, because a route that exists in one language and 404s in the other eight would break the language picker on exactly the page a reader reached for it on.

A locale with no translation for a page still gets the route: it renders the English body behind a notice (`docs.fallback`). That is the per-key fallback `src/i18n/t.ts` gives the shell strings, applied per page.

This is deliberately not the `src/i18n/sections/*.ts` pattern website-processing uses for its landing copy. Authoring long API prose as TypeScript string literals is miserable, and the shell strings that do need that format live in `src/i18n/sections/docsUi.ts`.

## Frontmatter

`title` and `description` are required; everything else has a default. The schema in `src/content.config.ts` documents each field and why it exists. Worth knowing:

- **`order`** sorts within a folder; ties break by title, so a folder can leave it off and still be stable. Watch for accidental interleaving when a folder mixes concept pages and sub-section indexes; that is why `api/content`, `api/integration` and `api/app` carry 40 / 50 / 60 rather than 10 / 20 / 30.
- **`navTitle`** shortens the sidebar label. The rail is 16.5rem; anything over about 24 characters truncates.
- **`source`** is a maintenance note listing the files in sibling repos the page was written against. It is never rendered. When you change something in city, `grep` this repo for the path.
- **`keywords`** feeds search only ([search.md](search.md#keywords)). Quote numeric keywords: YAML parses a bare `429` as a number and the schema wants strings.
- **`hidden` and `badge: draft`** keep a page out of the nav and/or the search index, and out of `sitemap.xml`: the sitemap builds from `indexableDocPaths()`, not `allDocPaths()`. Both still build, because a hidden deep-link has to stay reachable from the prose that links it.

## Components available in MDX

Handed to every page by `src/components/docs/mdx.tsx`. **Do not import them in the MDX file**; they are already in scope:

`<Callout>` `<Endpoint>` `<Params>` / `<Param>` `<Cards>` / `<Card>` `<Scopes>` `<Details>` `<Related>` `<Badge>`

The set is deliberately small. Anything expressible as Markdown stays Markdown; a component earns its place only when the docs need to be consistent about something: the shape of an endpoint, the meaning of a tone, what a required parameter looks like.

- **`<Param required>` is tri-state.** `true` renders REQUIRED, `false` renders OPTIONAL, and omitting it renders neither, because `<Params>` doubles as a labelled-block layout for things that are not parameters.
- **A `<Param name>` with a space in it is set in the body font, not mono.** A name with a space is prose ("The party queue"); one without is an identifier.
- **`<Details>` is a native `<details>`, and that is the point.** It costs no JavaScript, takes the keyboard, and the browser's own find still reaches a collapsed example. Use it past about fifteen lines of example: the two or three lines that show the shape stay in the prose, the rest opens.

## Code blocks

Shiki, dual-theme, configured in `astro.config.mjs` with `defaultColor: false`. Both palettes are emitted as CSS variables on every token, and `src/styles/components/Docs.css` picks which applies off the same `.dark` class the shared `<ThemeToggle/>` writes.

- **The wrapper class is `.astro-code`, not `.shiki`.** Astro renames it, and a `.shiki` selector matches nothing, which fails silently as unhighlighted code in the prose colour, readable enough to miss.
- Only the foreground comes from Shiki. The background stays the theme's own surface, because the Shiki themes' own backgrounds would put a differently coloured slab in the middle of every page.

## Writing style

The existing pages set the bar; match it.

- **Say why, not just what.** The reason `apiPublic` is a switch is more useful than the fact that it exists. Most of that reasoning already exists in `../website-city`'s Prisma doc comments and in its `docs/api/*.md`; read them before writing, and distil rather than invent.
- **Name the trap.** Where two things are confusable (`hidden` vs `archived`, usage policy vs access grants, `matchEmptyOnly` vs `matchPreferEmpty`, `wasOnline` vs "has ever been online"), say so explicitly in a `<Callout>`.
- **Do not quote a number that will drift.** Where a limit is operator-configurable, say so and name the setting.
- **Cross-link generously**, then run `npm run docs:check`.

## Link checking

`npm run docs:check` (`scripts/docs-lint.mjs`) resolves every internal `/learn/...` link, including `#anchor` fragments, against the pages that exist, warns about pages nothing links to from prose, and fails on a stray NUL byte in any source file. The build cannot catch a broken link: `/learn/content/relations/permission` (singular) is valid Markdown pointing at a 404, and in a corpus this heavily cross-linked it is the mistake that actually happens. Run it after any editing pass.
