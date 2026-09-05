# website-learn

The documentation site for [The Modding Community](https://moddingcommunity.com),
served at **`/learn`** on the main domain.

Astro + React, statically built. Shares its shell, theme and i18n machinery with
[`website-processing`](../website-processing) via
[`@modcommunity/shared`](../tmc-global/shared), so all three sites on the domain
look and behave identically.

## What is in it

| Section | Covers |
| --- | --- |
| Getting started | Accounts, navigating the site, publishing your first item |
| Content items | Every kind of item, and every relation that can be attached to one |
| Your account | Profile, security, privacy, notifications, credentials, subscriptions |
| Community | Reporting, penalties, moderation |
| Servers | Listing, claiming, the scanner, reporting your own statistics |
| Parties | Visibility, lifecycle, tech levels, matchmaking, integrating a game |
| API reference | The public content API, the integration API and the app API |

65 pages, served in nine languages.

## Running it

```bash
npm install
npm run shared:local     # build against ../tmc-global/shared
npm run dev
```

Then open <http://localhost:4321/learn>.

## Checks

```bash
npm run build         # astro check + full static build, all 585 pages
npm test              # vitest, over the search scorer in src/lib/
npm run docs:check    # internal links and anchors
npm run audit:overflow -- http://127.0.0.1:4477   # horizontal overflow, all widths
```

`npm run build` is the check to run after a change; `docs:check` is worth running
too, since the build does not catch a broken internal link. The overflow audit
needs Playwright, which is deliberately not a dependency.

## Writing a page

Add an `.mdx` file under `src/content/docs/en/`. Its path is its URL:

```
src/content/docs/en/api/content/reading.mdx
  ->  /learn/api/content/reading/
```

Every URL here carries a trailing slash — the canonical, hreflang and sitemap
URLs all assume it.

Translations are optional overlays at `src/content/docs/<locale>/<same path>`;
a page with no translation renders the English body behind a notice.

See [CLAUDE.md](./CLAUDE.md) for the frontmatter schema, the MDX component set,
the layout rules, and the conventions the existing pages follow.

## Deployment

nginx routes `^/learn` and `^/(es|fr|de|ru|nl|ja|zh|pt)/learn` to this build's
`dist/`, with:

```nginx
error_page 404 /learn/404/index.html;
```

The docs publish their own sitemap at `/learn/sitemap.xml` — website-processing
owns the domain root, so reference it from that repo's `robots.txt`.

There is deliberately no Astro `base` — see [CLAUDE.md](./CLAUDE.md) for why.

## Licence

GPL-3.0-only, like the rest of the stack.
