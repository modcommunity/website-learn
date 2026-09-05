#!/usr/bin/env node
/**
 * Checks every internal `/learn/...` link in the documentation against the set
 * of pages that actually exist.
 *
 * This is the one class of error the build cannot catch. Astro will fail on a
 * broken import or a malformed component, but a link to
 * `/learn/content/relations/permission` (singular) is valid Markdown pointing
 * at a 404 — and in a corpus this heavily cross-linked, that is the mistake
 * that actually happens.
 *
 * It reads the CONTENT tree rather than `dist/`, so it runs without a build and
 * is fast enough to be worth running on every save.
 *
 * Also flags:
 *   - links to `/learn/...#anchor` whose anchor is not a heading on that page;
 *   - source files containing a NUL byte, which makes them test as binary and
 *     be skipped silently by grep and everything like it;
 *   - pages nothing links to (orphans), as a warning only — a page reachable
 *     from the sidebar is not really an orphan, but a page nothing links to
 *     from prose is usually one that was meant to be linked and was not.
 *
 * Exit code 1 on a broken link, 0 otherwise. Orphans never fail the run.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DOCS = join(ROOT, 'src/content/docs')
const REFERENCE_LOCALE = 'en'

/** The mount point. Must match `DOCS_ROOT` in `src/docs/tree.ts`. */
const MOUNT = '/learn'

/* ------------------------------------------------------------------ Walking */

function walk(dir) {
    const out = []

    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)

        if (statSync(full).isDirectory()) out.push(...walk(full))
        else if (/\.mdx?$/.test(entry)) out.push(full)
    }

    return out
}

/** `src/content/docs/en/api/content/index.mdx` -> `api/content`. */
function pathOf(file) {
    return relative(join(DOCS, REFERENCE_LOCALE), file)
        .replace(/\.mdx?$/, '')
        .split(sep)
        .join('/')
        .replace(/\/index$/, '')
        .replace(/^index$/, '')
}

/* ------------------------------------------------------------------ Anchors */

/**
 * The slug GitHub-flavoured Markdown (and therefore Astro) gives a heading.
 * Kept in step with `github-slugger`: lowercase, strip anything that is not a
 * word character, space or hyphen, then spaces to hyphens.
 */
function slugify(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[`*_[\]()]/g, '')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .replace(/\s+/g, '-')
}

function headingsOf(body) {
    const slugs = new Set()
    const re = /^#{1,6}\s+(.+?)\s*$/gm

    let m
    while ((m = re.exec(body))) slugs.add(slugify(m[1]))

    return slugs
}

/* -------------------------------------------------------------------- Links */

/** Markdown links plus bare hrefs in JSX attributes (`<Card href="…">`). */
function linksOf(body) {
    const out = []

    const md = /\]\((\/learn[^)\s]*)\)/g
    const jsx = /href="(\/learn[^"]*)"/g

    let m
    while ((m = md.exec(body))) out.push(m[1])
    while ((m = jsx.exec(body))) out.push(m[1])

    return out
}

/* --------------------------------------------------------------------- Main */

const files = walk(join(DOCS, REFERENCE_LOCALE))

const pages = new Map() // path -> { file, anchors }
for (const file of files) {
    const body = readFileSync(file, 'utf8')
    pages.set(pathOf(file), { file, anchors: headingsOf(body) })
}

const broken = []
const linkedTo = new Set()

for (const file of files) {
    const body = readFileSync(file, 'utf8')
    const from = pathOf(file)

    for (const raw of linksOf(body)) {
        const [target, anchor] = raw.split('#')

        // `/learn` -> '', `/learn/api/content` -> 'api/content'
        const path = target.slice(MOUNT.length).replace(/^\//, '').replace(/\/$/, '')

        const page = pages.get(path)

        if (!page) {
            broken.push({ from, raw, why: 'no such page' })
            continue
        }

        linkedTo.add(path)

        if (anchor && !page.anchors.has(anchor)) {
            broken.push({ from, raw, why: 'no such heading on that page' })
        }
    }
}

/* ------------------------------------------------------------------ Report */

const rel = (p) => relative(ROOT, p)

if (broken.length > 0) {
    console.error(`\n${broken.length} broken documentation link(s):\n`)

    for (const b of broken) {
        console.error(`  ${b.from || '(home)'}`)
        console.error(`    -> ${b.raw}   (${b.why})`)
    }
    console.error('')
}

/*
 * A stray NUL byte in a source file makes `file`, `grep` and everything else
 * using that heuristic treat it as BINARY and skip it silently. One had got
 * into `DocsSearch.tsx` as a string separator that bought nothing, and the
 * cost was greps that should have matched coming back empty with no error —
 * the file was invisible to every text tool pointed at this repo.
 *
 * Nothing in a docs site legitimately contains one, so the check is: none,
 * anywhere in source. It walks the whole tree rather than just the content
 * directory, because the file it would have caught was a component.
 */
const SOURCE = /\.(mjs|js|jsx|ts|tsx|astro|mdx?|css|json|ya?ml)$/

function sourceFiles(dir) {
    const out = []

    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue

        const full = join(dir, entry)

        if (statSync(full).isDirectory()) out.push(...sourceFiles(full))
        else if (SOURCE.test(entry)) out.push(full)
    }

    return out
}

const withNuls = sourceFiles(join(ROOT, 'src'))
    .concat(sourceFiles(join(ROOT, 'scripts')))
    .filter((f) => readFileSync(f, 'utf8').includes('\0'))

if (withNuls.length > 0) {
    console.error(`\n${withNuls.length} source file(s) contain a NUL byte:\n`)
    for (const f of withNuls) console.error(`  ${relative(ROOT, f)}`)
    console.error(
        '\nA NUL makes the file test as binary, so grep and every tool using\n' +
            'that heuristic skip it without saying so. Remove it.\n'
    )
}

const orphans = [...pages.keys()].filter((p) => p !== '' && !linkedTo.has(p))

if (orphans.length > 0) {
    console.warn(`\n${orphans.length} page(s) not linked from any prose:\n`)
    for (const p of orphans) console.warn(`  ${p}  (${rel(pages.get(p).file)})`)
    console.warn(
        '\nThese are still reachable from the sidebar. Worth a look anyway —\n' +
            'a page nothing links to is usually one that was meant to be linked.\n'
    )
}

if (broken.length === 0 && withNuls.length === 0) {
    console.log(`✓ ${pages.size} pages, every internal link resolves, no stray NULs.`)
}

process.exit(broken.length > 0 || withNuls.length > 0 ? 1 : 0)
