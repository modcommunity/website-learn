import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { LOCALES, DEFAULT_LOCALE, type LocaleT } from '../../../i18n/config'
import { buildDocTree, docHref, flattenTree } from '../../../docs/tree'
// Shared with the client scorer: this decides what `text` contains, which is
// the input to everything the scorer does. See `src/lib/search.ts`.
import { toPlainText } from '../../../lib/search'

/**
 * The client-side search index, one file per locale, served at
 * `/learn/search/<locale>.json`.
 *
 * Per locale rather than one combined file because a reader only ever searches
 * their own language: bundling all nine would make every visitor download eight
 * indexes they will never query, and the Japanese and Russian bodies are the
 * two largest. Each file is fetched lazily — on the first keystroke, not on
 * page load — so the docs still cost zero extra bytes to read.
 *
 * `search` is therefore a RESERVED first path segment under `/learn`. A doc page
 * at `content/search` would still build (its route is `/learn/content/search`),
 * but one at `search/anything` would collide with this endpoint.
 */


/** The `##` / `###` headings, which are what deep links point at. */
function headingsOf(body: string): string[] {
    const out: string[] = []
    const re = /^(#{2,3})\s+(.+?)\s*$/gm

    let m: RegExpExecArray | null
    while ((m = re.exec(body))) {
        // Strip any inline markup left in the heading text.
        out.push(m[2]!.replace(/[`*_[\]]/g, '').trim())
    }

    return out
}

export function getStaticPaths() {
    return LOCALES.map((locale) => ({ params: { locale } }))
}

export const GET: APIRoute = async ({ params }) => {
    const locale = (params.locale ?? DEFAULT_LOCALE) as LocaleT

    // The tree already resolves titles per locale and drops hidden pages, so
    // the index and the sidebar can never disagree about what exists.
    const tree = await buildDocTree(locale)
    const flat = flattenTree(tree)

    const all = await getCollection('docs')
    const entriesFor = (path: string) => ({
        localized: all.find((e) => e.id === `${locale}/${path}`),
        english: all.find((e) => e.id === `${DEFAULT_LOCALE}/${path}`),
    })

    /**
     * Frontmatter `keywords` from BOTH the translated file and the English one,
     * deduped.
     *
     * The union rather than the localized set alone, because the two carry
     * different kinds of term. English keywords are mostly identifiers that do
     * not translate — `apiPublic`, `matchEmptyOnly`, an endpoint path — and a
     * reader on the Spanish build still searches for those by name. A locale's
     * own keywords are the words that language actually reaches for. Dropping
     * either half loses real queries, and the list is a handful of strings.
     */
    const keywordsFor = (path: string): string[] => {
        const { localized, english } = entriesFor(path)
        return [
            ...new Set([
                ...(localized?.data.keywords ?? []),
                ...(english?.data.keywords ?? []),
            ]),
        ]
    }

    const bodyFor = (path: string): string => {
        const { localized, english } = entriesFor(path)
        return (localized ?? english)?.body ?? ''
    }

    const docs = flat
        // Drafts are visibly marked in the nav but must not be findable — a
        // search hit is how someone lands on a page with no context at all.
        .filter((n) => n.badge !== 'draft')
        .map((node) => {
            const body = bodyFor(node.path)
            const section = node.path.split('/')[0]!

            return {
                path: node.path,
                href: node.href,
                title: node.title,
                description: node.description,
                section,
                // The section's own display title, so a result can say
                // "API reference › Authentication" without a second lookup.
                sectionTitle:
                    flat.find((n) => n.path === section)?.title ?? section,
                headings: headingsOf(body),
                // The author's own "this page is also about X" list. It is the
                // only signal here that is deliberate rather than derived, so
                // `DocsSearch` weights it above a heading — see WEIGHTS there.
                keywords: keywordsFor(node.path),
                // Capped: the whole point of the cap is that the index stays a
                // few hundred KB rather than a few MB, and a match past ~1200
                // words is almost always a worse result than a title match on
                // another page anyway.
                text: toPlainText(body).slice(0, 8000),
            }
        })

    return new Response(
        JSON.stringify({
            locale,
            root: docHref('', locale),
            docs,
        }),
        {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                // Static file; the build hash changes when the content does.
                'Cache-Control': 'public, max-age=3600',
            },
        }
    )
}
