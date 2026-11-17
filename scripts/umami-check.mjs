/**
 * Umami coverage guard. Two checks, one command:
 *
 *     npm run umami:check
 *
 * 1. Every registered event name in `src/lib/umami.ts` has a call site (the
 *    same rule `src/lib/umami.test.ts` asserts under vitest; kept here so it
 *    also runs without a test runner, mirroring website-processing).
 * 2. Every interactive handler in `src/**` (`onClick=`, `onSubmit=`, `<form`,
 *    `<button`, or a DOM `addEventListener('click'|'submit'|'change', ...)`)
 *    has a Umami event within a few lines (`track(`, `emit(`, `data-umami-event`,
 *    `data-doc-event`), OR is explicitly exempted with a comment on the same
 *    line or within the window:
 *
 *        // umami-ignore: <reason>      (in JSX braces, wrap that as a block comment)
 *
 *    Use the ignore only for pure-UI toggles (closing a modal, a drawer's
 *    scrim). A new control that acts on something real needs an event.
 *
 * Exit 1 lists the offending file:line.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')
const REGISTRY = join(SRC, 'lib', 'umami.ts')
const WINDOW = 10

const registry = readFileSync(REGISTRY, 'utf8')
const body = registry.slice(
    registry.indexOf('export const UMAMI_EVENTS = ['),
    registry.indexOf('] as const')
)
const names = [...body.matchAll(/^\s*'([a-z0-9_]+)',/gm)].map((m) => m[1])

if (names.length === 0) {
    console.error('Parsed no event names out of src/lib/umami.ts, has its shape changed?')
    process.exit(2)
}

function sources(dir, out = []) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name)

        if (e.isDirectory()) {
            // Page prose is MDX: no handlers, only registered components.
            if (e.name !== 'content') sources(p, out)
        } else if (/\.(astro|tsx?|mjs)$/.test(e.name) && !/\.test\.ts$/.test(e.name))
            out.push(p)
    }

    return out
}

const files = sources(SRC)
const texts = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]))
let bad = 0

// ---- 1. registered names are fired ---------------------------------------
const corpus = [...texts].filter(([f]) => f !== REGISTRY).map(([, t]) => t)

for (const name of new Set(names)) {
    if (!corpus.some((t) => t.includes(`'${name}'`) || t.includes(`"${name}"`))) {
        bad++
        console.log(`  UNFIRED    ${name}`)
    }
}

// ---- 2. handlers carry an event ------------------------------------------
const HANDLER = /\bonClick=|\bonSubmit=|<form[\s>]|<button[\s>]|addEventListener\(\s*['"](click|submit|change)['"]/
const COVERED = /\btrack\(|\bemit\(|data-umami-event|data-doc-event|umami-ignore|umami\.track\(/

for (const [file, text] of texts) {
    if (file === REGISTRY) continue

    const lines = text.split('\n')

    lines.forEach((line, i) => {
        if (!HANDLER.test(line)) return
        if (/^\s*(\*|\/\/|\/\*)/.test(line)) return // prose in a comment

        const from = Math.max(0, i - WINDOW)
        const to = Math.min(lines.length, i + WINDOW + 1)

        if (!COVERED.test(lines.slice(from, to).join('\n'))) {
            bad++
            console.log(`  NO EVENT   ${relative(ROOT, file)}:${i + 1}  ${line.trim().slice(0, 80)}`)
        }
    })
}

if (bad > 0) {
    console.log(
        `\n${bad} problem(s). Fire an event through src/lib/umami.ts (or ` +
            'data-umami-event), or mark a pure-UI toggle with `umami-ignore: <reason>`.'
    )
    process.exit(1)
}

console.log(`OK: ${names.length} registered events all fired; every handler has an event or an umami-ignore.`)
