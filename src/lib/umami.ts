/**
 * Umami event tracking for the documentation site.
 *
 * The same shape as website-city's `src/utils/umami/event.ts` — a flat registry
 * of names, a permissive data bag, and a `track()` that can never throw — so
 * that somebody who knows one knows the other. It is a separate copy rather
 * than a shared module because this is a static Astro build with no dependency
 * on the Next app, and the two registries have almost nothing in common
 * anyway: one measures a catalogue, this measures a book.
 *
 * ------------------------------------------------- Why a docs site needs any
 *
 * A pageview is a poor instrument here, and for a reason specific to this
 * build: **a Umami pageview records the path and drops the query string and the
 * hash.** Almost everything a reader does in documentation is one of those two.
 *
 *   * A search happens in a modal over whatever page they were on. The query
 *     never reaches the URL, so a corpus-wide "what do people look for and not
 *     find" is invisible — and on a static site with a client-side index there
 *     is no query endpoint whose logs could answer it instead.
 *   * A table-of-contents click is a `#hash` jump. No pageview, no navigation.
 *   * Opening a `<Details>` block — the long examples and wire dumps — changes
 *     nothing observable at all.
 *   * Copying a code block is the single strongest signal a docs page can emit
 *     that it did its job, and it produces no request of any kind.
 *
 * So the events below are not a finer-grained pageview. Each one is a thing
 * that otherwise leaves no trace whatsoever.
 *
 * -------------------------------------------------------- The rule for names
 *
 * Borrowed verbatim from website-city, because it is the rule that keeps a
 * registry honest: **do not register a name nothing fires.** A registry listing
 * events the site cannot emit is worse than one that is missing some, because
 * it reads as coverage. Every name below has a call site.
 *
 * And: an event carries an IDENTIFIER, never a translated label. A nav entry
 * with nine translations must be one row in Umami, not nine.
 */

/**
 * Every event this site may emit. Adding one is a line here plus the call —
 * `track()` only accepts a registered name, so a typo is a build error rather
 * than a row in Umami nobody ever looks for again.
 */
export const UMAMI_EVENTS = [
    /*
     * Search. The whole point of instrumenting this site.
     *
     * `docs_search_query` is fired DEBOUNCED on a settled query, never per
     * keystroke: typing "authentication" would otherwise file fourteen
     * searches, thirteen of which are prefixes nobody meant. It carries the
     * query text and the number of hits, and `results: 0` is the most valuable
     * row this site produces — it is a reader asking the documentation a
     * question it does not answer, named in their own words.
     *
     * `docs_search_select` separates "searched" from "found something":
     * `rank` says how far down the list the answer was, which is the only
     * feedback the scoring in `lib/search.ts` ever gets.
     *
     * `docs_search_abandon` is the third outcome and the one a funnel needs —
     * a query was typed, results were shown, and the reader closed the modal
     * without opening any of them. Without it, "searched and gave up" is
     * indistinguishable from "searched and is still reading the list".
     */
    'docs_search_open',
    'docs_search_query',
    'docs_search_select',
    'docs_search_abandon',
    /*
     * The index is a static JSON file fetched on first keystroke. If it 404s
     * after a bad deploy, search silently does nothing and no server log
     * anywhere records a failure the reader can see.
     */
    'docs_search_error',

    /*
     * The sidebar tree. `section` is the folder slug and `href` the
     * destination — both identifiers, never the translated label.
     *
     * The expand/collapse event is what says whether the tree is opened at all
     * or whether people navigate entirely from prose links and search, which is
     * the question that decides how much of it to render expanded by default.
     */
    'docs_nav_link',
    'docs_nav_section_toggle',
    /** The mobile drawer, which is a different affordance with the same tree. */
    'docs_nav_drawer',

    /*
     * Table of contents. Every entry is a same-page `#hash`, so this control is
     * completely invisible without an event.
     *
     * Carries the heading's DEPTH and its position in the list rather than its
     * text: "are readers reaching for sub-sections or only top-level ones" is
     * what decides how deep the list should go, and the text is translated.
     *
     * There is no companion `docs_toc_toggle`: the rail does not collapse.
     * Add one when it does — and not before, which is the rule in the header.
     */
    'docs_toc_click',
    /** The heading anchor link added by `DocsEnhancements` — a shared deep link. */
    'docs_heading_anchor',

    /*
     * Code blocks. Copying one is the strongest "this page worked" a docs site
     * gets, and it produces no request. `lang` and `lines` say which examples
     * are actually used, which is what justifies keeping a long one.
     */
    'docs_code_copy',
    'docs_code_copy_error',

    /*
     * `<Details>` — the collapsed long examples. The component's own docstring
     * says it exists so a page can carry a working example without the example
     * becoming the page; whether anybody opens them is the test of that, and
     * nothing else can see it.
     */
    'docs_details_open',

    /*
     * In-prose navigation: the `<Card>` grids on section index pages, the
     * `<Related>` footer, and the prev/next pager.
     *
     * These compete with the sidebar for the same job. Which one people use is
     * what decides whether the cards are worth maintaining per section.
     */
    'docs_card_click',
    'docs_related_click',
    'docs_pager',

    /*
     * Leaving. An outbound click was already auto-tagged by the analytics
     * snippet as `outbound-link-click`; these two are the ones worth naming
     * because they are journeys BETWEEN our own sites, which that tagger
     * deliberately ignores (same host).
     */
    'docs_app_link',
    'docs_launcher',

    /* Shell. */
    'docs_locale_change',
    'docs_theme_change',
    'docs_account',

    /*
     * A 404 under `/learn`, carrying the path that missed.
     *
     * nginx serves this build's own 404 page for every unmatched path under
     * `/learn` and `/{locale}/learn`, so in Umami they all collapse into one
     * pageview of `/learn/404/` with no record of what was actually asked for.
     * A renamed page whose inbound links are stale is exactly the thing this
     * finds, and it is otherwise findable only by reading nginx's log.
     */
    'docs_not_found',
] as const

export type UmamiEventName = (typeof UMAMI_EVENTS)[number]

export type UmamiEventData = Record<
    string,
    string | number | boolean | null | undefined
>

declare global {
    interface Window {
        umami?: {
            track: (name: string, data?: UmamiEventData) => void
        }
    }
}

/**
 * Fire an event. Safe during SSR, safe before the Umami script has loaded, and
 * it never throws — analytics must never be able to break a page.
 *
 * `path` and `locale` are filled in automatically. `path` because every event
 * here needs to know which document it happened on and no caller should have to
 * remember; `locale` because this build serves nine of them off one set of
 * components, and "which languages is the documentation actually read in" is a
 * question the pageview path can technically answer but only by string
 * surgery on every row.
 */
export function track(name: UmamiEventName, data?: UmamiEventData): void {
    try {
        if (typeof window === 'undefined') return

        const payload: UmamiEventData = {
            path: window.location.pathname,
            locale: localeFromPath(window.location.pathname),
            ...data,
        }

        if (window.umami) window.umami.track(name, payload)
    } catch {
        // Swallowed on purpose. A tracking failure is invisible to the reader.
    }
}

/**
 * The locale a `/learn` URL is under.
 *
 * `/learn/...` is English and `/{lang}/learn/...` is everything else — the
 * shape `astro.config.mjs` deliberately keeps, so that the language picker in
 * the shared header lands on the same URL shape across all three sites.
 */
export function localeFromPath(path: string): string {
    const m = /^\/([a-z]{2})\/learn(\/|$)/.exec(path)

    return m?.[1] ?? 'en'
}

/**
 * Truncate a search query before it becomes an event field.
 *
 * Two reasons, and the second is the one that matters. A query is free text a
 * reader typed, so it can be arbitrarily long — and it can also be something
 * they pasted by accident. Capping it keeps a stray paste out of the analytics
 * store, and keeps one row from carrying a paragraph.
 */
export function queryField(query: string): string {
    const q = query.trim()

    return q.length > 80 ? `${q.slice(0, 80)}…` : q
}
