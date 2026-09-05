import { getCollection, type CollectionEntry } from 'astro:content'
import { DEFAULT_LOCALE, isLocale, type LocaleT } from '../i18n/config'
import { SECTION_META } from './sections'
import { DOCS_ROOT, docHref, type NavNode } from './mount'

/*
 * Re-exported so a server-side caller keeps importing these from the module
 * that uses them. They LIVE in `./mount.ts` because client islands need them
 * too and this module imports `astro:content` — see the note there.
 */
export { DOCS_ROOT, docHref, type NavNode }

export type DocEntry = CollectionEntry<'docs'>

/**
 * A page in the tree, already resolved for one locale.
 *
 * `path` is the **locale-less** route ('api/content/authentication', or '' for
 * the docs home) and is the identity used everywhere: the pager keys off it,
 * the sidebar highlights off it, and the language picker swaps locale without
 * touching it. `href` is that path rendered for the locale in hand.
 */
export type DocNode = {
    path: string
    href: string
    title: string
    /** Sidebar label — `navTitle` when the page sets one, else `title`. */
    navLabel: string
    description: string
    order: number
    badge?: 'new' | 'updated' | 'draft'
    hidden: boolean
    /** True when this locale actually has the file, rather than falling back. */
    translated: boolean
    children: DocNode[]
}

/** Strip the leading locale segment from a collection id. `en/api` -> `api`. */
function idToPath(id: string): string {
    const slash = id.indexOf('/')
    return slash === -1 ? '' : id.slice(slash + 1)
}

/** Build the collection id for a path under a locale. `api`, 'es' -> `es/api`. */
function pathToId(path: string, locale: LocaleT): string {
    return path ? `${locale}/${path}` : locale
}

/**
 * Every English page, which is the canonical shape of the documentation.
 *
 * Translations are *overlays*: a locale contributes a translated title and body
 * for the pages it has, and inherits English for the rest. It can never
 * contribute a page of its own — a route that exists in one language and 404s
 * in the other eight is worse than an untranslated page, and it would make the
 * language picker's "same page, other language" promise a lie.
 */
async function referenceEntries(): Promise<DocEntry[]> {
    const all = await getCollection('docs')
    return all.filter(
        (e) => e.id === DEFAULT_LOCALE || e.id.startsWith(`${DEFAULT_LOCALE}/`)
    )
}

/**
 * The whole tree for one locale, as top-level sections in {@link SECTION_META}
 * order. The docs home (`''`) is not part of it — it is the tree's container,
 * not an entry in it.
 */
export async function buildDocTree(
    locale: string | undefined
): Promise<DocNode[]> {
    const loc: LocaleT = isLocale(locale) ? locale : DEFAULT_LOCALE

    const reference = await referenceEntries()

    // The translated overlay, indexed by locale-less path so the lookup below
    // is a map hit rather than a scan per page.
    const translated = new Map<string, DocEntry>()
    if (loc !== DEFAULT_LOCALE) {
        for (const e of await getCollection('docs')) {
            if (e.id === loc || e.id.startsWith(`${loc}/`)) {
                translated.set(idToPath(e.id), e)
            }
        }
    }

    const nodes = new Map<string, DocNode>()

    for (const entry of reference) {
        const path = idToPath(entry.id)
        if (!path) continue // the docs home

        const local = translated.get(path)
        const data = local?.data ?? entry.data

        nodes.set(path, {
            path,
            href: docHref(path, loc),
            title: data.title,
            navLabel: data.navTitle ?? data.title,
            description: data.description,
            order: entry.data.order,
            badge: entry.data.badge,
            hidden: entry.data.hidden,
            translated: Boolean(local),
            children: [],
        })
    }

    // Attach each node to its parent folder. A page whose parent folder has no
    // `index.mdx` has nothing to hang off, so it is promoted to the top level
    // rather than silently dropped — a missing section index should look wrong
    // in the sidebar, not make pages disappear from it.
    const roots: DocNode[] = []

    for (const [path, node] of nodes) {
        const cut = path.lastIndexOf('/')
        const parent = cut === -1 ? null : nodes.get(path.slice(0, cut))

        if (parent) parent.children.push(node)
        else roots.push(node)
    }

    sortNodes(roots, true)

    return roots.filter((n) => !n.hidden)
}

/** `order` first, then title, so a folder that sets no orders is still stable. */
function sortNodes(nodes: DocNode[], topLevel = false) {
    nodes.sort((a, b) => {
        if (topLevel) {
            const ao = SECTION_META[a.path]?.order ?? 1000
            const bo = SECTION_META[b.path]?.order ?? 1000
            if (ao !== bo) return ao - bo
        }
        if (a.order !== b.order) return a.order - b.order
        return a.title.localeCompare(b.title)
    })

    for (const n of nodes) {
        n.children = n.children.filter((c) => !c.hidden)
        sortNodes(n.children)
    }
}

/**
 * The tree flattened into reading order — a section, then its pages, then the
 * next section. This is what the ← Prev / Next → pager walks, so "next" crosses
 * a section boundary into the following section's index rather than dead-ending
 * at the last page of the one you are in.
 */
export function flattenTree(nodes: DocNode[]): DocNode[] {
    const out: DocNode[] = []

    const walk = (list: DocNode[]) => {
        for (const n of list) {
            out.push(n)
            walk(n.children)
        }
    }
    walk(nodes)

    return out
}

/**
 * Narrow the tree to what the sidebar island renders.
 *
 * Call this on the way into `<DocsNav/>` — see the note on {@link NavNode} for
 * why it is worth the extra function.
 */
export function toNavTree(nodes: DocNode[]): NavNode[] {
    return nodes.map((n) => ({
        path: n.path,
        href: n.href,
        navLabel: n.navLabel,
        ...(n.badge ? { badge: n.badge } : {}),
        children: toNavTree(n.children),
    }))
}

/** The section, then each intermediate folder, then the page itself. */
export function breadcrumbsFor(path: string, tree: DocNode[]): DocNode[] {
    const segments = path.split('/').filter(Boolean)
    const trail: DocNode[] = []

    let list = tree
    let acc = ''

    for (const seg of segments) {
        acc = acc ? `${acc}/${seg}` : seg
        const hit = list.find((n) => n.path === acc)
        if (!hit) break
        trail.push(hit)
        list = hit.children
    }

    return trail
}

/**
 * Resolve one page for a locale, falling back to English when that locale has
 * not translated it yet.
 *
 * Returns the entry to RENDER plus whether it is a fallback, because the page
 * has to say so: a French reader who lands on English prose after clicking the
 * French flag needs to know it is missing, not that the picker is broken.
 */
export async function resolveDoc(
    path: string,
    locale: string | undefined
): Promise<{ entry: DocEntry; fallback: boolean } | undefined> {
    const loc: LocaleT = isLocale(locale) ? locale : DEFAULT_LOCALE
    const all = await getCollection('docs')

    const find = (id: string) => all.find((e) => e.id === id)

    if (loc !== DEFAULT_LOCALE) {
        const local = find(pathToId(path, loc))
        if (local) return { entry: local, fallback: false }
    }

    const english = find(pathToId(path, DEFAULT_LOCALE))
    return english
        ? { entry: english, fallback: loc !== DEFAULT_LOCALE }
        : undefined
}

/**
 * Every route the docs serve, as locale-less paths — the docs home included.
 *
 * Both `src/pages/learn/[...slug].astro` and its `[lang]` twin call this, so the
 * nine language trees are generated from one list and cannot drift.
 */
export async function allDocPaths(): Promise<string[]> {
    const reference = await referenceEntries()
    return reference.map((e) => idToPath(e.id))
}

/**
 * The subset of {@link allDocPaths} that may be advertised to search engines.
 *
 * `hidden` and `badge: 'draft'` are both statements that a page should not be
 * *found* — `hidden` keeps it out of the nav and the search index, `draft` out
 * of the search index. Neither stops it building, and that is deliberate: a
 * hidden deep-link has to stay reachable by its URL from the prose that links
 * it. But a sitemap is the one artefact that goes out and asks to be indexed,
 * so generating it from `allDocPaths` submitted, in nine languages, exactly the
 * pages the other two surfaces withhold.
 *
 * A page under a hidden or draft ancestor is excluded too, matching
 * {@link buildDocTree}, which drops a hidden node's whole subtree with it.
 */
export async function indexableDocPaths(): Promise<string[]> {
    const reference = await referenceEntries()

    const withheld = new Set(
        reference
            .filter((e) => e.data.hidden || e.data.badge === 'draft')
            .map((e) => idToPath(e.id))
    )

    const underWithheld = (path: string): boolean => {
        let acc = ''
        for (const seg of path.split('/')) {
            acc = acc ? `${acc}/${seg}` : seg
            if (withheld.has(acc)) return true
        }
        return false
    }

    return reference
        .map((e) => idToPath(e.id))
        .filter((path) => !underWithheld(path))
}
