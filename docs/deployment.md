# Deployment: where it is mounted, and why there is no `base`

Production serves the docs on their own host, `docs.moddingcommunity.com`, under the same `/learn` paths (`moddingcommunity.com/learn` is a 404 there, by design):

```
https://docs.moddingcommunity.com/learn/
https://docs.moddingcommunity.com/learn/api/content/authentication/
https://docs.moddingcommunity.com/es/learn/api/content/authentication/
```

The build defaults describe that deploy: `PUBLIC_URL` (canonical, hreflang, sitemap) defaults to the docs host, and `PUBLIC_MAIN_URL` defaults (production builds only) to `https://moddingcommunity.com`, so the shared chrome links back to the main domain and the shared theme/language cookies go on its parent domain. The repo can still be mounted at `/learn` on the main domain: set `PUBLIC_URL` to the main origin and `PUBLIC_MAIN_URL=` to the empty string.

## No `base: '/learn'`

Do not add `base: '/learn'` to `astro.config.mjs`. `base` is a single static prefix and would put the locale inside it (`/learn/es/api`), while website-city and website-processing both serve `/es/...`. A reader who switches language in the shared header has to land on the same shape of URL on all three builds, or the picker sends them to a 404. So `/learn` is a real route directory instead:

```
src/pages/learn/[...slug].astro          ->  /learn/**              (English)
src/pages/[lang]/learn/[...slug].astro   ->  /{es,fr,…}/learn/**    (the other 8)
```

nginx routes both `^/learn` and `^/(es|fr|de|ru|nl|ja|zh|pt)/learn` here (`docker/nginx.conf.template`), and serves this build's own 404 for unmatched paths under them:

```nginx
error_page 404 /learn/404/index.html;
```

Astro's directory output builds `src/pages/learn/404.astro` to `dist/learn/404/index.html`, not `404.html`. Every URL on this site carries a trailing slash and the canonical, hreflang and sitemap URLs all assume it, so the format is not worth changing for one page.

## Assets live under `/learn/_astro`

Those two prefixes cover the whole build, which is what `build.assets: 'learn/_astro'` is for. Astro's default puts hashed CSS, JS and fonts at `/_astro/`, outside both prefixes, and website-processing is also an Astro build on this domain emitting the same prefix, which the host sends to its container. The result would be a doc page whose HTML serves fine while its stylesheet and every island 404. Under `/learn` the two builds cannot collide, and adding a page never needs an nginx change.

`public/` is the deliberate exception: `favicon.ico` and `images/` stay at the root because they are byte-identical to website-processing's copies and are already served from there.

## On its own origin: `PUBLIC_MAIN_URL`, not `PUBLIC_URL`

The shell's links are bare paths. The shared chrome data holds `/mods`, not an absolute URL, so the shared Header can match them against `activePath`, and a bare path resolves against whatever host served the page. On the docs host every header entry would point at a page the docs host does not have.

`PUBLIC_MAIN_URL` is the fix, applied at render time in `i18n/link.tsx` and in the three places that build an anchor outside it: the shared `AccountButton` (given `cityUrl={MAIN_URL}` in `SiteHeader`), `SiteSidebar`'s share card, and the `a` in `components/docs/mdx.tsx` for prose links. Set empty, every link stays relative, so a main-domain deploy costs nothing.

**`PUBLIC_URL` is not that variable**, and setting it instead is the natural mistake: it is this build's own origin (canonical, hreflang, Open Graph and the sitemap), so on a subdomain it is the docs host, not the main site.

Outside this repo: website-city's `AUTH_COOKIE_DOMAIN` must be set to the shared parent domain, or the `tmc_auth` hint cookie stays host-only and `lib/auth-hint.ts` sees a signed-in reader as signed out, and the `tmc_locale` language cookie stays host-only so a language picked on the app never reaches the docs. This repo derives the same domain from `PUBLIC_MAIN_URL` (`WriteLocaleCookie(next, { mainUrl: MAIN_URL })` in `SiteHeader`, and the inline script in `Layout.astro` that sends an unprefixed page to the reader's language).

## Sitemap and reserved paths

The docs publish their own sitemap at `/learn/sitemap.xml`, scoped there because website-processing owns `/robots.txt` and `/sitemap.xml` at the domain root. Reference it from that repo's robots.txt:

```
Sitemap: https://docs.moddingcommunity.com/learn/sitemap.xml
```

`src/pages/learn/search/[locale].json.ts` also lives under that prefix, which makes **`search` a reserved first path segment**: a doc page at `search/anything` would collide with the search index endpoint.
