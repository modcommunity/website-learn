# The shell, its dependencies, and the nav

## A sibling of website-processing, not a fork

This is the third site on the same domain:

| Repo | Serves | Stack |
| --- | --- | --- |
| `../website-city` | The app itself: everything at `/mods`, `/servers`, `/account`, … | Next.js |
| `../website-processing` | The landing page and the legal pages | Astro |
| this | `/learn`: the documentation | Astro |

The shell (header, icon rail, footer, language picker, theme toggle, analytics, fonts, styles, i18n machinery) was copied from website-processing deliberately, so the three sites look and behave identically. **When you change shell behaviour here, check whether website-processing needs the same change.**

## Dependencies

The same as website-processing ([its dependencies doc](../../website-processing/docs/dependencies.md)), plus `@astrojs/mdx` and `@fontsource-variable/jetbrains-mono`, minus `react-multi-carousel`, which nothing here uses.

- `@modcommunity/shared` has two sources, the published package (what `npm ci` gets) and the local checkout at `../tmc-global/shared`. Switch with `npm run shared:local` / `shared:registry`; check with `shared:status`. Both use `--no-save`, so switching never shows in `git status`. **A plain `npm install` restores the registry version; re-run `shared:local` after one.**
- A shared change is not live here until it is published (registry mode) or linked and rebuilt with `npm run shared:build` (local mode).
- In local mode the two repos must be on matching branches. The symptom of a mismatch is `"X" is not exported by ".../shared"` for a component that plainly exists.
- `astro.config.mjs` sets `optimizeDeps.exclude: ['@modcommunity/shared']`, so `shared:build` is safe with the dev server up.
- **Icons: `lucide-react` is the house set.** `react-icons` is only for brand marks (Discord, X, GitHub, Steam, Facebook, from `react-icons/fa6`). lucide icons are stroke-based: colour them with `text-*`, never `fill-*`.

## One deliberate divergence from city's nav

City, website-processing and this site all carry the same **Docs** leaf (top of the header's Resources menu, the footer's Resources column, the rail's Resources section). City and processing point it at `https://docs.moddingcommunity.com`; `src/i18n/nav.tsx` points it at `/learn`, because a docs site should not leave its own origin to reach itself. That href is the one place the navs differ.

Everything else in the chrome (header, rail, footer columns, social row, copyright) must match website-city. `~/stack/scripts/check-layout-sync.sh` compares them in all nine locales (it treats `/learn` as the docs URL) and prints a diff on drift; the structure is also published as `tmc-global/shared/src/data/site-nav.json`.
