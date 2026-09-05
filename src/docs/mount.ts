import {
    DEFAULT_LOCALE,
    isLocale,
    localizeUrl,
    type LocaleT,
} from '../i18n/config'

/**
 * Where the documentation is mounted, and how to build a URL into it.
 *
 * Split out of `./tree.ts` — an import-free module apart from the locale
 * helpers — because both a SERVER module and a CLIENT island need the same
 * answer, and `tree.ts` imports `astro:content`. A React island importing a
 * value from there is a build failure (`ServerOnlyModule`), not a runtime one:
 * `astro:content` is server-only and pulling it into a client bundle fails the
 * whole build with an error that names the module rather than the import that
 * dragged it in.
 *
 * `../website-city` splits `types/server/scan_tier.ts` out of
 * `lib/server/scan-queue.ts` for exactly this reason, and for exactly this
 * class of trap.
 *
 * `tree.ts` re-exports both of these, so a server-side caller keeps importing
 * them from the module that uses them.
 */

/** The path the documentation is served under, on the main domain. */
export const DOCS_ROOT = '/learn'

/**
 * The public URL of a doc page in a locale.
 *
 * `path` is the locale-less route (`api/content/authentication`, or `''` for
 * the docs home) — the identity used everywhere: the pager keys off it, the
 * sidebar highlights off it, and the language picker swaps locale without
 * touching it.
 */
export function docHref(path: string, locale: string | undefined): string {
    const loc: LocaleT = isLocale(locale) ? locale : DEFAULT_LOCALE
    return localizeUrl(path ? `${DOCS_ROOT}/${path}` : DOCS_ROOT, loc)
}

/**
 * The projection of a {@link DocNode} that the sidebar island actually renders.
 *
 * Astro serialises island props into a `props="…"` attribute on every page, so
 * a field nobody reads is a field shipped 594 times. The full node carries a
 * `description` (for the search index), a `title` (the H1), an `order`, a
 * `hidden` and a `translated` — none of which the tree looks at, and which
 * together were 20KB of the 33KB payload on every documentation page.
 *
 * Declared here rather than in `./tree.ts` for the same reason `DOCS_ROOT` is:
 * the island imports it, and `tree.ts` imports `astro:content`.
 */
export type NavNode = {
    path: string
    href: string
    navLabel: string
    badge?: 'new' | 'updated' | 'draft'
    children: NavNode[]
}
