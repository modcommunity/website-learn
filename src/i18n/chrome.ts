import { buildChrome, ShellCatalogKey, type ChromeT } from '@modcommunity/shared'
import { getT } from './t'

/**
 * This site's header nav, rail, footer, socials and copyright: the shared
 * `buildChrome` over the package's `site-nav.json`, the same call website-city,
 * website-processing and website-status make, so a link edited once shows on
 * all four. There is no copy of the link lists here any more; the one agreed
 * difference (Docs points at `/learn`, because a docs site should not leave
 * itself to reach itself) is `site: 'learn'` in the package's
 * `SITE_CHROME_OVERRIDES`.
 *
 * Labels come from this site's catalogues (`nav.*` in `sections/shellNav.ts`,
 * `rail.*` from the shared `shellSidebar`, `footer.*` in
 * `sections/shellFooter.ts`), which `ShellCatalogKey` maps city's keys onto.
 * The hrefs stay bare paths: `localeLink` makes the non-`/learn` ones absolute
 * on `PUBLIC_MAIN_URL` at render time, so `activePath` matching still works.
 *
 * `signedIn` keeps the signed-in-only rail entries; callers pass the auth hint,
 * which reads false on the server and on first paint, so hydration matches.
 */
export function learnChrome(locale: string, signedIn = false): ChromeT {
    return buildChrome({
        site: 'learn',
        t: getT(locale),
        keys: ShellCatalogKey,
        locale,
        signedIn,
    })
}
