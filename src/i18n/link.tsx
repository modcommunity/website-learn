import type { LinkComponent, LinkProps } from '@modcommunity/shared'
import { isLocale, localizeUrl, type LocaleT } from './config'

/**
 * Locale-aware link for the shared Header / Sidebar / Footer.
 *
 * The nav configs in `nav.tsx` keep **bare** hrefs (`/mods`, `/tos`) because the
 * shared components match them against `activePath` to highlight the current
 * entry — prefixing them there would break that comparison. So the prefix is
 * applied at render time instead: this is passed as `linkComponent`, and every
 * internal href comes out localized (`/fr/mods`) while external links, anchors
 * and protocol-relative URLs pass through untouched.
 *
 * website-city uses the same "as-needed" prefixing (English unprefixed, others
 * under `/xx`), so links that leave this site for the app stay in-language too.
 */
function isInternal(href: string): boolean {
    return href.startsWith('/') && !href.startsWith('//')
}

/**
 * Internal paths that are linked from the global chrome but are not worth
 * passing link equity to.
 *
 * The legal column sits in the footer, so it is linked from EVERY page on the
 * domain — without this the terms of service outranks the pages the site is
 * actually about by internal link count alone. They stay crawlable and
 * indexable (a legal page nobody can fetch is a legal page nobody can read);
 * they just stop voting.
 *
 * Mirrors `NOFOLLOW_PREFIXES` in website-city's `src/lib/metadata/crawl.ts` —
 * both apps serve the same footer on the same domain, so the two lists have to
 * agree.
 */
const NOFOLLOW_PREFIXES = ['/tos', '/privacy-policy', '/licenses']

function shouldNoFollow(href: string): boolean {
    if (!isInternal(href)) return false

    const path = href.split('?')[0]!.replace(/\/+$/, '')

    return NOFOLLOW_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))
}

/** Merge `nofollow` into whatever the caller asked for, without duplicating. */
function mergeRel(href: string, rel: string | undefined, blank: boolean) {
    const parts = new Set((rel ?? '').split(/\s+/).filter(Boolean))

    if (!rel && blank) {
        parts.add('noopener')
        parts.add('noreferrer')
    }

    // Off-site links from the shared chrome are our own socials and Discord —
    // ours, but not pages we need to vouch for.
    if (blank || shouldNoFollow(href)) parts.add('nofollow')

    return parts.size > 0 ? Array.from(parts).join(' ') : undefined
}

// Cached per locale so the component identity is stable across renders — a fresh
// function component each render would remount the whole nav subtree.
const CACHE = new Map<string, LinkComponent>()

export function localeLink(locale: string): LinkComponent {
    const cached = CACHE.get(locale)
    if (cached) return cached

    const target: LocaleT = isLocale(locale) ? locale : 'en'

    function LocaleLink({ href, target: t, rel, children, ...rest }: LinkProps) {
        return (
            <a
                href={isInternal(href) ? localizeUrl(href, target) : href}
                target={t}
                rel={mergeRel(href, rel, t === '_blank')}
                {...rest}
            >
                {children}
            </a>
        )
    }

    CACHE.set(locale, LocaleLink)
    return LocaleLink
}
