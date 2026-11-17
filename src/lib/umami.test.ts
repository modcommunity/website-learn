import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UMAMI_EVENTS, localeFromPath, queryShape, track } from './umami'

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

    /*
     * A QUOTED occurrence, not a bare substring.
     *
     * Both ways an event is fired put the name in quotes —
     * `track('docs_code_copy')` and `data-umami-event="docs_pager"` — while a
     * substring match says yes to any prose containing the word. The sibling
     * check in website-processing found `account` "wired" by thirteen
     * translation strings about somebody's account.
     */
    const fires = (name: string) =>
        corpus.includes(`'${name}'`) || corpus.includes(`"${name}"`)

    it.each(UMAMI_EVENTS)('%s is fired from somewhere', (name) => {
        expect(
            fires(name),
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

describe('queryShape', () => {
    it('describes a query without containing it', () => {
        const secret = 'me@example.com token=abc123'
        const out = queryShape(`  ${secret}  `)

        expect(JSON.stringify(out)).not.toContain('example')
        expect(JSON.stringify(out)).not.toContain('abc123')
        expect(out).toEqual({ qlen: secret.length, qwords: 2, qbucket: 'long' })
    })

    it('buckets by length and counts words', () => {
        expect(queryShape('api')).toEqual({ qlen: 3, qwords: 1, qbucket: 'short' })
        expect(queryShape('how to publish').qbucket).toBe('medium')
        expect(queryShape('')).toEqual({ qlen: 0, qwords: 0, qbucket: 'short' })
    })
})

describe('track', () => {
    afterEach(() => vi.unstubAllGlobals())

    it('is a no-op without a window (SSR)', () => {
        expect(() => track('docs_search_open')).not.toThrow()
    })

    it('is a no-op when Umami is absent, blocked or not loaded', () => {
        vi.stubGlobal('window', { location: { pathname: '/learn/' } })
        expect(() => track('docs_search_open')).not.toThrow()
    })

    it('never throws when umami.track itself throws', () => {
        vi.stubGlobal('window', {
            location: { pathname: '/learn/' },
            umami: { track: () => { throw new Error('blocked') } },
        })
        expect(() => track('docs_search_open')).not.toThrow()
    })

    it('adds path and locale and passes the data through', () => {
        const spy = vi.fn()
        vi.stubGlobal('window', {
            location: { pathname: '/es/learn/api/' },
            umami: { track: spy },
        })
        track('docs_pager', { dir: 'next' })
        expect(spy).toHaveBeenCalledWith('docs_pager', {
            path: '/es/learn/api/',
            locale: 'es',
            dir: 'next',
        })
    })
})
