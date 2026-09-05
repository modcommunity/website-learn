import type { APIRoute } from 'astro'
import { LOCALES, DEFAULT_LOCALE, localizeUrl } from '../../i18n/config'
import { indexableDocPaths, DOCS_ROOT } from '../../docs/tree'
import { SITE_URL } from '../../lib/site'

/**
 * The documentation's own sitemap, at `/learn/sitemap.xml`.
 *
 * Scoped to `/learn` rather than living at the domain root, because
 * website-processing owns `/robots.txt` and `/sitemap.xml` — the three sites
 * share one domain, and two builds cannot both claim that path. Reference this
 * one from the root sitemap index (or from `robots.txt`) in website-processing:
 *
 *     Sitemap: https://moddingcommunity.com/learn/sitemap.xml
 *
 * Every page is emitted once per locale with a full `hreflang` set pointing at
 * its eight siblings plus an `x-default`. Without those, the nine copies of a
 * page compete as duplicate content — which is exactly the failure mode a
 * translated docs site has, since most locales currently serve the English body
 * behind a notice and are therefore near-identical.
 */

/** Written into every entry, so one build's pages all agree. */
const LASTMOD = new Date().toISOString().slice(0, 10)

/**
 * Priority by depth: the docs home above a section index above a page. Search
 * engines treat this as a hint about relative importance WITHIN this sitemap,
 * which is exactly what it is — it says nothing about the rest of the domain.
 */
function priorityFor(path: string): string {
    if (path === '') return '1.0'
    return path.includes('/') ? '0.6' : '0.8'
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

export const GET: APIRoute = async () => {
    // NOT allDocPaths: hidden and draft pages build, but must not be
    // submitted for indexing. See indexableDocPaths.
    const paths = await indexableDocPaths()

    const entries: string[] = []

    for (const path of paths) {
        const base = path ? `${DOCS_ROOT}/${path}` : DOCS_ROOT

        // Astro's directory output serves every page at a trailing slash, so the
        // canonical form here has to match or the sitemap advertises a redirect.
        const href = (locale: (typeof LOCALES)[number]) =>
            escapeXml(
                new URL(`${localizeUrl(base, locale)}/`.replace(/\/+$/, '/'), SITE_URL).href
            )

        const alternates = LOCALES.map(
            (l) =>
                `    <xhtml:link rel="alternate" hreflang="${l}" href="${href(l)}"/>`
        ).join('\n')

        for (const locale of LOCALES) {
            entries.push(
                [
                    '  <url>',
                    `    <loc>${href(locale)}</loc>`,
                    `    <lastmod>${LASTMOD}</lastmod>`,
                    `    <priority>${priorityFor(path)}</priority>`,
                    alternates,
                    `    <xhtml:link rel="alternate" hreflang="x-default" href="${href(DEFAULT_LOCALE)}"/>`,
                    '  </url>',
                ].join('\n')
            )
        }
    }

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...entries,
        '</urlset>',
    ].join('\n')

    return new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
}
