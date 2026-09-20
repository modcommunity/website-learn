import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { UMAMI_EVENTS, localeFromPath, queryField } from './umami'

/**
 * The registry's own rule, made checkable.
 *
 * `umami.ts` states it in prose — **do not register a name nothing fires**,
 * because a registry listing events the site cannot emit reads as coverage —
 * and prose does not fail a build. This did: `docs_toc_toggle` was registered
 * for a collapse control the table of contents does not have.
 *
 * The opposite direction matters more and TypeScript already covers it:
 * `track()` takes a `UmamiEventName`, so an unregistered name is a type error
 * rather than a row in Umami that nobody ever queries because nobody knows it
 * is there. That is why this only checks one way.
 */
const SRC = join(process.cwd(), 'src')

function sources(dir = SRC, out: string[] = []): string[] {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name)

        if (e.isDirectory()) sources(p, out)
        else if (/\.(tsx?|astro)$/.test(e.name) && !/\.test\.ts$/.test(e.name))
            out.push(p)
    }

    return out
}

describe('the Umami event registry', () => {
    const corpus = sources()
        // The registry itself names every event by definition.
        .filter((f) => !f.endsWith(join('lib', 'umami.ts')))
        .map((f) => readFileSync(f, 'utf8'))
        .join('\n')

    it.each(UMAMI_EVENTS)('%s is fired from somewhere', (name) => {
        expect(
            corpus.includes(name),
            `'${name}' is registered but nothing emits it. Wire it up, or ` +
                `delete the entry — a registry that lists events the site ` +
                `cannot emit reads as coverage.`
        ).toBe(true)
    })

    it('has no duplicate names', () => {
        expect(new Set(UMAMI_EVENTS).size).toBe(UMAMI_EVENTS.length)
    })
})

describe('localeFromPath', () => {
    it('reads the prefix off a localized docs URL', () => {
        expect(localeFromPath('/es/learn/api/')).toBe('es')
        expect(localeFromPath('/zh/learn/')).toBe('zh')
    })

    it('calls an unprefixed path English, which is the default locale', () => {
        expect(localeFromPath('/learn/api/')).toBe('en')
        expect(localeFromPath('/learn')).toBe('en')
    })

    /*
     * `/learn` is a real route directory rather than an Astro `base`, so a
     * two-letter segment only means a locale when `/learn` follows it. Without
     * the second half of the pattern, the site's own root-level assets would
     * read as languages.
     */
    it('does not mistake any two-letter segment for a locale', () => {
        expect(localeFromPath('/es/other/')).toBe('en')
        expect(localeFromPath('/eslearn/')).toBe('en')
        expect(localeFromPath('/')).toBe('en')
    })
})

describe('queryField', () => {
    it('trims and passes an ordinary query through', () => {
        expect(queryField('  how do i publish  ')).toBe('how do i publish')
    })

    /*
     * A search box takes whatever somebody pastes into it. The cap is what
     * keeps a stray paste out of the analytics store and stops one row
     * carrying a paragraph.
     */
    it('truncates something far too long', () => {
        const out = queryField('x'.repeat(500))

        expect(out).toHaveLength(81)
        expect(out.endsWith('…')).toBe(true)
    })

    it('leaves a query exactly at the limit alone', () => {
        expect(queryField('y'.repeat(80))).toBe('y'.repeat(80))
    })
})
