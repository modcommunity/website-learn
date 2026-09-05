import { DEFAULT_LOCALE, isLocale, localizeUrl } from './config'
import { MESSAGES } from './messages'

// Some translated copy embeds links (the servers blurb's game links, for one).
// Prefixing them here keeps a locale's markup in-language without duplicating
// the prefix into all nine catalogues. `(?!\/)` skips protocol-relative URLs.
const INTERNAL_HREF = /href="(\/(?!\/)[^"]*)"/g

/** A translate function: dot-path key + optional `{var}` params. */
export type TFunc = (
    key: string,
    params?: Record<string, string | number>
) => string

function lookup(obj: unknown, path: string): string | undefined {
    let cur: unknown = obj
    for (const part of path.split('.')) {
        if (cur == null || typeof cur !== 'object') return undefined
        cur = (cur as Record<string, unknown>)[part]
    }
    return typeof cur === 'string' ? cur : undefined
}

/**
 * Build a translate function for a locale. Missing keys fall back to English, so
 * a partially-translated locale still renders. Works on the server (Astro
 * components) and the client (React islands) — the catalogue is plain data.
 */
export function getT(locale: string | undefined): TFunc {
    const loc = isLocale(locale) ? locale : DEFAULT_LOCALE
    const dict = MESSAGES[loc]
    const fallback = MESSAGES[DEFAULT_LOCALE]

    return (key, params) => {
        let val = lookup(dict, key) ?? lookup(fallback, key) ?? key
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                val = val.split(`{${k}}`).join(String(v))
            }
        }
        if (loc !== DEFAULT_LOCALE && val.includes('href="/')) {
            val = val.replace(
                INTERNAL_HREF,
                (_match, path: string) => `href="${localizeUrl(path, loc)}"`
            )
        }
        return val
    }
}
