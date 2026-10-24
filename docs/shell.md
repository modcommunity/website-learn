# The shell, its dependencies, and the nav

## A sibling of website-processing, not a fork

This is the third site on the same domain:

| Repo | Serves | Stack |
| --- | --- | --- |
| `../website-city` | The app itself: everything at `/mods`, `/servers`, `/account`, … | Next.js |
| `../website-processing` | The landing page and the legal pages | Astro |
| this | `/learn`: the documentation | Astro |

The shell (header, icon rail, footer, language picker, theme toggle, analytics, fonts, styles, i18n machinery) was copied from website-processing deliberately, so the three sites look and behave identically. **When you change shell behaviour here, check whether website-processing needs the same change.**
- Theme: `Layout.astro` inlines the shared `ThemeInitScript()` (`@modcommunity/shared/theme`: `tmc_theme` cookie, then `tmc:theme`, then OS); `ThemeToggle` gets the same `cookieOptions` as `WriteLocaleCookie`, so the cookie shares the parent domain with `tmc_locale`.

## Dependencies

The same as website-processing ([its dependencies doc](../../website-processing/docs/dependencies.md)), plus `@astrojs/mdx` and `@fontsource-variable/jetbrains-mono`, minus `react-multi-carousel`, which nothing here uses.

- `@modcommunity/shared` has two sources, the published package (what `npm ci` gets) and the local checkout at `../tmc-global/shared`. Switch with `npm run shared:local` / `shared:registry`; check with `shared:status`. Both use `--no-save`, so switching never shows in `git status`. **A plain `npm install` restores the registry version; re-run `shared:local` after one.**
- **Held back on purpose:** `typescript` stays on 6: the newest `@astrojs/check` (0.9.10) has peer `typescript ^5 || ^6`, and TS 7 (native) has no JS API for its language server; re-check when `@astrojs/check` publishes a TS 7 peer. `@types/node` stays on 24: the Dockerfile builds on `node:lts` (24 until 26 becomes LTS) and types should match the runtime, not the newer local Node 25. `tailwindcss-intersect` is on 3, whose `Observer` lives at `tailwindcss-intersect/observer`.
- A shared change is not live here until it is published (registry mode) or linked and rebuilt with `npm run shared:build` (local mode).
- In local mode the two repos must be on matching branches. The symptom of a mismatch is `"X" is not exported by ".../shared"` for a component that plainly exists.
- `astro.config.mjs` sets `optimizeDeps.exclude: ['@modcommunity/shared']`, so `shared:build` is safe with the dev server up.
- **Icons: `lucide-react` is the house set.** `react-icons` is only for brand marks (Discord, X, GitHub, Steam, Facebook, from `react-icons/fa6`). lucide icons are stroke-based: colour them with `text-*`, never `fill-*`.

## One deliberate divergence from city's nav

City, website-processing and this site all carry the same **Docs** leaf (top of the header's Resources menu, the footer's Resources column, the rail's Resources section). City and processing point it at `https://docs.moddingcommunity.com`; here it is `/learn`, because a docs site should not leave its own origin to reach itself. That href is the one place the navs differ, and it lives in the package as data (`SITE_CHROME_OVERRIDES.learn`), not here: `src/i18n/chrome.ts` is one `buildChrome({ site: 'learn', … })` call, so this repo holds no copy of the link lists.

Everything else in the chrome (header, rail, footer columns, social row, copyright) is the same on every site, because all four build it with `buildChrome` from `tmc-global/shared/src/data/site-nav.json`, the hand-edited source since 4.10.0 (website-city no longer keeps its own nav lists). A nav change is an edit and publish in tmc-global. `~/stack/scripts/check-layout-sync.sh` validates that JSON and checks, in all nine locales, that this site's catalogue has a string for every key it draws and that its `buildChrome` call passes `site: 'learn'` and no overrides of its own.
