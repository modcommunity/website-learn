import { describe, expect, it } from 'vitest'
import { countOf, mark, search, snippetFor, toPlainText, type Doc } from './search'

/**
 * The search scorer was the largest piece of logic on this site with no
 * coverage at all: `npm run build` proves it compiles and `docs:check` proves
 * the links resolve, but neither can tell you that a query returns the right
 * page in the right order, or that a snippet is safe to hand to
 * `dangerouslySetInnerHTML`.
 */

function doc(over: Partial<Doc> = {}): Doc {
    return {
        path: 'api/errors',
        href: '/learn/api/errors',
        title: 'Errors',
        description: 'What the API returns when something goes wrong.',
        section: 'api',
        sectionTitle: 'API',
        headings: [],
        keywords: [],
        text: '',
        ...over,
    }
}

describe('search', () => {
    it('returns nothing for an empty or whitespace-only query', () => {
        const docs = [doc({ text: 'anything' })]

        expect(search(docs, '')).toEqual([])
        expect(search(docs, '   ')).toEqual([])
    })

    it('requires every term to match (AND, not OR)', () => {
        const both = doc({ path: 'a', title: 'Party scopes', text: 'party scopes' })
        const one = doc({ path: 'b', title: 'Parties', text: 'party party party' })

        const hits = search([both, one], 'party scopes')

        expect(hits.map((h) => h.doc.path)).toEqual(['a'])
    })

    it('ranks a title match above a body mention', () => {
        const titled = doc({ path: 'a', title: 'Rate limits', text: 'unrelated prose' })
        const mentioned = doc({ path: 'b', title: 'Something else', text: 'rate limits' })

        const hits = search([titled, mentioned], 'rate limits')

        expect(hits[0]!.doc.path).toBe('a')
    })

    it('ranks a curated keyword above an incidental heading', () => {
        const keyworded = doc({ path: 'a', title: 'A', keywords: ['throttling'] })
        const headinged = doc({ path: 'b', title: 'B', headings: ['Throttling'] })

        const hits = search([keyworded, headinged], 'throttling')

        expect(hits.map((h) => h.doc.path)).toEqual(['a', 'b'])
    })

    it('scores keywords even though they appear nowhere in the prose', () => {
        // The whole point of the field: the page never says "429", but a
        // reader who saw that status code searches for it by number.
        const hits = search([doc({ keywords: ['429'] })], '429')

        expect(hits).toHaveLength(1)
    })

    it('tolerates an index built before `keywords` existed', () => {
        const stale = { ...doc(), keywords: undefined } as unknown as Doc

        expect(() => search([stale], 'errors')).not.toThrow()
        expect(search([stale], 'errors')).toHaveLength(1)
    })

    it('gives diminishing returns to repetition', () => {
        const many = doc({ path: 'a', title: 'X', text: 'party '.repeat(90) })
        const few = doc({ path: 'b', title: 'X', text: 'party party party' })

        const [first, second] = search([many, few], 'party')

        expect(first!.score).toBeGreaterThan(second!.score)
        // 30x the mentions, and it buys under 3x the score. Linear frequency
        // would have made this page unbeatable on the strength of repetition
        // alone — that is the whole reason for the log.
        expect(first!.score).toBeLessThan(second!.score * 3)
    })

    it('rewards the whole phrase appearing adjacent', () => {
        const adjacent = doc({ path: 'a', title: 'X', text: 'the rate limits apply' })
        const scattered = doc({ path: 'b', title: 'X', text: 'the rate at which limits apply' })

        const hits = search([adjacent, scattered], 'rate limits')

        expect(hits[0]!.doc.path).toBe('a')
    })

    it('still matches the phrase when the query was typed with extra spaces', () => {
        const docs = [doc({ path: 'a', title: 'X', text: 'the rate limits apply' })]

        const tidy = search(docs, 'rate limits')[0]!
        const sloppy = search(docs, 'rate   limits')[0]!

        expect(sloppy.score).toBe(tidy.score)
    })

    it('caps the result list', () => {
        const docs = Array.from({ length: 40 }, (_, i) =>
            doc({ path: `p${i}`, title: 'Errors' })
        )

        expect(search(docs, 'errors')).toHaveLength(12)
    })
})

describe('countOf', () => {
    it('counts non-overlapping occurrences', () => {
        expect(countOf('aaaa', 'aa')).toBe(2)
        expect(countOf('party party', 'party')).toBe(2)
        expect(countOf('nothing here', 'party')).toBe(0)
    })

    it('returns 0 for an empty needle rather than looping forever', () => {
        expect(countOf('anything', '')).toBe(0)
    })
})

describe('mark', () => {
    it('wraps the matched term and escapes everything else', () => {
        expect(mark('Errors and <Callout>', ['errors'])).toBe(
            '<mark>Errors</mark> and &lt;Callout&gt;'
        )
    })

    it('is case-insensitive but keeps the original casing', () => {
        expect(mark('The API Returns', ['api'])).toBe('The <mark>API</mark> Returns')
    })

    /*
     * These four are the regression tests for escaping BEFORE matching. The
     * old order escaped the text and then ran the terms over the result, so
     * the entities it had just produced were themselves searchable: a query
     * for `&` matched the `&` of `&amp;` and cut the entity in half, and
     * `amp`/`lt`/`gt`/`quot` marked the inside of entities that appear
     * nowhere in the prose the reader is looking at.
     */
    it('does not cut an entity in half when the term is a special character', () => {
        expect(mark('A & B', ['&'])).toBe('A <mark>&amp;</mark> B')
    })

    it('does not match the inside of an entity it produced itself', () => {
        expect(mark('Rate & limit', ['amp'])).toBe('Rate &amp; limit')
        expect(mark('Use <Callout>', ['lt'])).toBe('Use &lt;Callout&gt;')
        expect(mark('He said "hi"', ['quot'])).toBe('He said &quot;hi&quot;')
    })

    it('marks a literal angle bracket the reader actually searched for', () => {
        expect(mark('a < b', ['<'])).toBe('a <mark>&lt;</mark> b')
    })

    it('never emits an unescaped bracket from the corpus', () => {
        const hostile = '<script>alert(1)</script> & "quotes"'
        const out = mark(hostile, ['script', 'alert', '&', '"'])

        // Every `<` and `>` left in the output belongs to a <mark> tag.
        expect(out.replace(/<\/?mark>/g, '')).not.toMatch(/[<>]/)
    })

    it('prefers the longest term so a shorter one does not split the run', () => {
        expect(mark('party member list', ['party', 'party member'])).toBe(
            '<mark>party member</mark> list'
        )
    })

    it('treats regex metacharacters in a term as literal text', () => {
        expect(mark('a.b and axb', ['a.b'])).toBe('<mark>a.b</mark> and axb')
        expect(() => mark('anything', ['('])).not.toThrow()
    })

    it('escapes the text when there is nothing to mark', () => {
        expect(mark('a & b', [])).toBe('a &amp; b')
        expect(mark('a & b', [''])).toBe('a &amp; b')
    })
})

describe('snippetFor', () => {
    it('falls back to the description when the match was not in the body', () => {
        const d = doc({ description: 'A summary.', text: 'unrelated' })

        expect(snippetFor(d, ['errors'])).toBe('A summary.')
    })

    it('windows around the first body match and ellipsises', () => {
        const d = doc({ text: `${'x'.repeat(200)} party ${'y'.repeat(200)}` })

        const snippet = snippetFor(d, ['party'])

        expect(snippet.startsWith('…')).toBe(true)
        expect(snippet.endsWith('…')).toBe(true)
        expect(snippet).toContain('<mark>party</mark>')
    })

    it('does not lead with an ellipsis when the match is at the start', () => {
        const d = doc({ text: `party ${'y'.repeat(200)}` })

        expect(snippetFor(d, ['party']).startsWith('…')).toBe(false)
    })

    it('escapes body prose that contains markup', () => {
        const d = doc({ text: 'see <Callout> for party rules' })

        expect(snippetFor(d, ['party'])).not.toContain('<Callout>')
    })
})

describe('toPlainText', () => {
    it('drops fenced code blocks wholesale', () => {
        const out = toPlainText('before\n```js\nconst secret = 1\n```\nafter')

        expect(out).not.toContain('secret')
        expect(out).toContain('before')
        expect(out).toContain('after')
    })

    it('strips JSX tags but keeps the prose between them', () => {
        expect(toPlainText('<Callout type="warn">Be careful</Callout>')).toContain(
            'Be careful'
        )
    })

    it('keeps a link label and drops its target', () => {
        const out = toPlainText('see [the errors page](/learn/api/errors) for more')

        expect(out).toContain('the errors page')
        expect(out).not.toContain('/learn/api/errors')
    })

    it('drops import statements and collapses whitespace', () => {
        const out = toPlainText("import Callout from '../x'\n\n\nreal    prose")

        expect(out).toBe('real prose')
    })
})
