import { LOCALE_COOKIE } from './config'
import { MAIN_URL } from '../lib/site'

/**
 * The `Domain=` the shared `tmc_locale` cookie is written with, or `undefined`
 * for a host-only cookie.
 *
 * On a docs-subdomain deploy (`docs.moddingcommunity.com`) a host-only cookie
 * never reaches the main domain, so a language picked here was invisible to
 * website-city and website-processing, and theirs was invisible here. The
 * shared parent is the main domain's host whenever this page's host is a
 * subdomain of it — derived from `PUBLIC_MAIN_URL`, which that deploy already
 * sets, so there is no second variable to keep in step. When the docs are
 * mounted at `/learn` on the main domain (`MAIN_URL` empty), host-only already
 * reaches both.
 *
 * The inline script in `Layout.astro` repeats this check; it runs before any
 * module loads, so it cannot import it.
 */
export function localeCookieDomain(): string | undefined {
    if (!MAIN_URL || typeof location === 'undefined') return undefined

    try {
        const main = new URL(MAIN_URL).hostname

        return location.hostname.endsWith(`.${main}`) ? main : undefined
    } catch {
        return undefined
    }
}

/**
 * Remember `locale` in the cookie website-city's middleware and the other two
 * sites read.
 *
 * With a shared domain it also expires any host-only copy first: a browser
 * holding both sends both, in an order the server cannot tell apart, so an old
 * host-only `de` could outvote a new shared `en`.
 */
export function writeLocaleCookie(locale: string): void {
    try {
        const domain = localeCookieDomain()

        if (domain) {
            document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0; samesite=lax`
        }

        document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${
            60 * 60 * 24 * 365
        }; samesite=lax${domain ? `; domain=${domain}` : ''}${
            location.protocol === 'https:' ? '; secure' : ''
        }`
    } catch {
        /* ignore */
    }
}
