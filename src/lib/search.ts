/**
 * The documentation search scorer.
 *
 * Split out of `components/docs/DocsSearch.tsx` so it can be tested: these are
 * pure functions with no I/O, no React and no DOM, and they are the part of
 * search that can be quietly wrong. The component still owns the dialog, the
 * fetch and the keyboard handling; this file owns "which pages match, in what
 * order, and what does the snippet look like".
 *
 * `toPlainText` lives here too rather than in the search endpoint, because it
 * decides what the `text` field of every indexed doc contains — the input to
 * everything below.
 */

export type Doc = {
    path: string
    href: string
    title: string
    description: string
    section: string
    sectionTitle: string
    headings: string[]
    /** Frontmatter `keywords` — terms the page is about but may never say. */
    keywords: string[]
    text: string
}

export type Hit = {
    doc: Doc
    score: number
    /** The passage the match came from, with the query terms marked. */
    snippet: string
}

export const WEIGHTS = {
    title: 40,
    keyword: 20,
    heading: 12,
    description: 8,
    path: 6,
    text: 1,
}

/** The most hits the dialog will ever show. */
export const MAX_HITS = 12

/** Rough plain-text rendering of an MDX body — enough to match words against. */
export function toPlainText(body: string): string {
    return (
        body
            // Fenced code: the contents are usually the least useful thing to
            // match on (every API page contains `curl` and `Authorization`) and
            // the most expensive to carry, so drop them wholesale.
            .replace(/```[\s\S]*?```/g, ' ')
            // JSX blocks from the MDX component set — <Callout>, <Endpoint>, …
            // Their ATTRIBUTES carry real prose (a callout's title, an
            // endpoint's summary), so strip only the tags, not the text between.
            .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
            // Import statements at the top of every MDX file.
            .replace(/^import .*$/gm, ' ')
            // Link syntax -> the label; images -> nothing.
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            // Inline code, emphasis, headings, table pipes, list bullets.
            .replace(/[`*_>#|]/g, ' ')
            .replace(/^\s*[-+]\s+/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    )
}

/*
 * Scoring.
 *
 * Every query term must appear somewhere in the page (AND, not OR) — with a
 * corpus this small, an OR search for "party scopes" returns every page that
 * says "party" and buries the one page that is about both. Where a term matches
 * decides the weight: a title match is the page being ABOUT the term, a body
 * match is the page merely mentioning it.
 */
export function search(docs: Doc[], raw: string): Hit[] {
    const query = raw.trim().toLowerCase()
    if (!query) return []

    const terms = query.split(/\s+/).filter(Boolean)

    const hits: Hit[] = []

    for (const doc of docs) {
        const title = doc.title.toLowerCase()
        const description = doc.description.toLowerCase()
        // Newline-separated, not space-separated: it keeps two adjacent
        // headings from reading as one phrase. It must not be a NUL — that is
        // what this was, and one NUL byte makes the whole file test as binary,
        // so `grep` and every tool using that heuristic silently skip it.
        const headings = doc.headings.join('\n').toLowerCase()
        // `?? []` because a browser can still hold an index fetched from a
        // build made before this field existed; the endpoint allows an hour.
        const keywords = (doc.keywords ?? []).join('\n').toLowerCase()
        const text = doc.text.toLowerCase()
        const path = doc.path.toLowerCase()

        let score = 0
        let matchedAll = true

        for (const term of terms) {
            let termScore = 0

            if (title.includes(term)) {
                termScore += WEIGHTS.title
                // An exact title, or a title that STARTS with the term, beats a
                // title that happens to contain it in the middle.
                if (title === term) termScore += WEIGHTS.title
                else if (title.startsWith(term)) termScore += WEIGHTS.title / 2
            }
            if (headings.includes(term)) termScore += WEIGHTS.heading
            // Curated rather than derived: the author saying "people look
            // for this page under that word" outranks an incidental heading.
            if (keywords.includes(term)) termScore += WEIGHTS.keyword
            if (description.includes(term)) termScore += WEIGHTS.description
            if (path.includes(term)) termScore += WEIGHTS.path

            const occurrences = countOf(text, term)
            // Diminishing returns: a page that says "party" 90 times is not 90
            // times more relevant than one that says it 3 times.
            if (occurrences > 0) {
                termScore += WEIGHTS.text * (1 + Math.log(occurrences))
            }

            if (termScore === 0) {
                matchedAll = false
                break
            }

            score += termScore
        }

        if (!matchedAll) continue

        // The whole phrase adjacent is a much stronger signal than the terms
        // scattered across the page. Rebuilt from `terms` rather than reusing
        // `query`, so a query typed with a double space still matches the
        // single-spaced prose it is looking for.
        if (terms.length > 1) {
            const phrase = terms.join(' ')
            if (title.includes(phrase)) score += WEIGHTS.title
            if (text.includes(phrase)) score += WEIGHTS.heading
        }

        hits.push({ doc, score, snippet: snippetFor(doc, terms) })
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, MAX_HITS)
}

export function countOf(haystack: string, needle: string): number {
    if (!needle) return 0

    let count = 0
    let i = haystack.indexOf(needle)

    while (i !== -1) {
        count++
        i = haystack.indexOf(needle, i + needle.length)
    }

    return count
}

/** The description, or the passage around the first body match, terms marked. */
export function snippetFor(doc: Doc, terms: string[]): string {
    const lower = doc.text.toLowerCase()

    let at = -1
    for (const term of terms) {
        const i = lower.indexOf(term)
        if (i !== -1 && (at === -1 || i < at)) at = i
    }

    // No body hit (the match was in the title) — the description IS the summary.
    if (at === -1) return mark(doc.description, terms)

    const start = Math.max(0, at - 60)
    const raw = doc.text.slice(start, start + 200)

    return `${start > 0 ? '…' : ''}${mark(raw, terms)}…`
}

const ESCAPES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"]/g, (c) => ESCAPES[c]!)
}

/**
 * Wrap the matches in `<mark>`, escaping everything around them.
 *
 * The snippet is inserted with `dangerouslySetInnerHTML` — it has to be, the
 * marks are markup — and the text it is built from is documentation prose full
 * of `<Callout>`, `&`, and quoted JSON. So every character that is not one of
 * the marks this function adds must come out escaped.
 *
 * Matching happens against the ORIGINAL text and the escaping is applied to the
 * pieces afterwards. Escaping first and matching the result looks equivalent and
 * is not: the escaped form contains `&amp;`, `&lt;`, `&quot;`, so a reader
 * searching for `&` got `<mark>&</mark>amp;` — a broken entity rendered as the
 * literal text `&amp;` — and a search for `amp`, `lt` or `quot` marked the
 * inside of entities that were never in the prose. Escaping after marking is
 * not an option either: it would eat the marks.
 */
export function mark(text: string, terms: string[]): string {
    // Longest first, so "party member" marks as one run rather than "party"
    // swallowing the start of the longer term's match.
    const sorted = [...terms].sort((a, b) => b.length - a.length)
    const pattern = sorted
        .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter(Boolean)
        .join('|')

    if (!pattern) return escapeHtml(text)

    const re = new RegExp(pattern, 'gi')

    let out = ''
    let last = 0
    let m: RegExpExecArray | null

    while ((m = re.exec(text)) !== null) {
        // A zero-length match cannot advance `lastIndex` on its own, so the
        // loop would never end. `filter(Boolean)` above should make this
        // unreachable; it costs two lines to make sure it stays that way.
        if (m[0] === '') {
            re.lastIndex++
            continue
        }

        out += escapeHtml(text.slice(last, m.index))
        out += `<mark>${escapeHtml(m[0])}</mark>`
        last = m.index + m[0].length
    }

    return out + escapeHtml(text.slice(last))
}
