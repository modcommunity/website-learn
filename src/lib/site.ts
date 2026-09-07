/**
 * The site's public origin. `Layout.astro` reads the same `PUBLIC_URL` for its
 * canonical/hreflang/Open Graph URLs; `robots.txt` and `sitemap.xml` import it
 * from here so all four agree on one origin per deploy.
 *
 * On a docs-subdomain deploy this is the DOCS origin
 * (`https://docs.moddingcommunity.com`), not the main site — it describes the
 * pages this build serves, which is what a canonical URL is for. The links that
 * leave for the app are governed by {@link MAIN_URL} below instead. Setting
 * this one and expecting the header to follow is the mistake it invites.
 */
export const SITE_URL: string = import.meta.env.PUBLIC_URL ?? 'https://moddingcommunity.com'

/**
 * The origin every link in the shell that ISN'T a docs page points at — the
 * main domain, where website-city (`/mods`, `/servers`, `/login`) and
 * website-processing (`/tos`, `/community`) both live.
 *
 * Empty by default, and empty means "same origin as this page": the nav configs
 * hold bare paths (`/mods`) precisely so the shared Header can match them
 * against `activePath`, and a bare path resolves against whatever host served
 * the page. That is correct — and free — when the docs are mounted at
 * `/learn` on the main domain, which is the deployment the rest of this repo is
 * shaped around.
 *
 * Set it when the docs get their OWN origin. Without it, every `/mods` in the
 * header resolves to `docs.moddingcommunity.com/mods`, which does not exist:
 * the header looks right and every entry in it 404s.
 *
 * The trailing slash is stripped so `PUBLIC_MAIN_URL=https://x.com/` and
 * `…/x.com` both produce `https://x.com/mods` rather than a doubled slash.
 */
export const MAIN_URL: string = (import.meta.env.PUBLIC_MAIN_URL ?? '')
    .trim()
    .replace(/\/+$/, '')

/**
 * Does this path belong to the documentation — i.e. is it served by THIS build?
 *
 * Everything else in the shell belongs to the main domain. Takes the bare,
 * unlocalized href, because that is the form the nav configs hold and the form
 * the caller has before `localizeUrl` turns `/learn/api` into `/es/learn/api`.
 */
export function isDocsPath(href: string): boolean {
    const path = href.split(/[?#]/)[0]!

    return path === '/learn' || path.startsWith('/learn/')
}

/**
 * Absolutize a path onto the main domain, or leave it relative when
 * {@link MAIN_URL} is unset. Takes the LOCALIZED path — city prefixes locales
 * the same way this site does, so a reader who crosses over stays in-language.
 */
export function mainUrl(path: string): string {
    return MAIN_URL ? `${MAIN_URL}${path}` : path
}
