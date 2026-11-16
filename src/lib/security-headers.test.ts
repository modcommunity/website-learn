import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

/**
 * The security headers: docker/nginx.conf.template must send all of them from
 * every location that has its own add_header (nginx does not inherit them
 * into one), and docker/25-security-headers.sh must turn CSP_MODE and the
 * analytics settings into the two CSP variables the template sends.
 */
const root = join(__dirname, '..', '..')
const template = readFileSync(join(root, 'docker', 'nginx.conf.template'), 'utf8')
const script = join(root, 'docker', '25-security-headers.sh')

const REQUIRED = [
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    'add_header Strict-Transport-Security "max-age=31536000" always;',
    'add_header X-Frame-Options "SAMEORIGIN" always;',
    'add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), hid=(), bluetooth=()" always;',
    'add_header Content-Security-Policy-Report-Only $learn_csp_report_only always;',
    'add_header Content-Security-Policy $learn_csp_enforce always;',
]

/** The server block's own lines and each location's body, comments dropped. */
function Blocks(): { name: string; body: string }[] {
    const lines = template
        .split('\n')
        .map((l) => l.replace(/#.*$/, '').trim())
        .filter(Boolean)
    const out: { name: string; body: string }[] = [{ name: 'server', body: '' }]
    let cur: { name: string; body: string } | null = null

    for (const l of lines) {
        if (l.startsWith('location ')) {
            cur = { name: l, body: '' }
            out.push(cur)
        } else if (cur && l === '}') {
            cur = null
        } else if (cur) {
            cur.body += l + '\n'
        } else {
            out[0]!.body += l + '\n'
        }
    }

    return out
}

describe('nginx.conf.template', () => {
    const blocks = Blocks()

    it('finds the server block and its locations', () => {
        expect(blocks.map((b) => b.name)).toContain('location /learn/_astro/ {')
        expect(blocks.length).toBeGreaterThan(3)
    })

    for (const b of blocks) {
        const own = b.body.includes('add_header')
        it(`${b.name}: every security header, or none of its own`, () => {
            if (b.name !== 'server' && !own) return
            for (const h of REQUIRED) expect(b.body).toContain(h)
        })
    }

    it('HSTS has no includeSubDomains or preload', () => {
        const hsts = template.split('\n').filter((l) => /add_header Strict-Transport-Security/.test(l))
        expect(hsts.length).toBeGreaterThan(0)
        for (const l of hsts) expect(l).not.toMatch(/includeSubDomains|preload/)
    })
})

describe('25-security-headers.sh', () => {
    const dir = mkdtempSync(join(tmpdir(), 'learn-csp-'))
    afterAll(() => rmSync(dir, { recursive: true, force: true }))

    function Run(env: Record<string, string>): { conf: string; ro: string; enf: string } {
        const out = join(dir, 'csp.conf')
        execFileSync('sh', [script], {
            env: { PATH: process.env.PATH ?? '/usr/bin:/bin', CSP_CONF_OUT: out, ...env },
            stdio: ['ignore', 'ignore', 'ignore'],
        })
        const conf = readFileSync(out, 'utf8')
        const ro = /\$learn_csp_report_only \{ default "([^"]*)"; \}/.exec(conf)?.[1]
        const enf = /\$learn_csp_enforce \{ default "([^"]*)"; \}/.exec(conf)?.[1]
        if (ro === undefined || enf === undefined) throw new Error(`bad conf:\n${conf}`)

        return { conf, ro, enf }
    }

    it('defaults to report-only', () => {
        const { ro, enf } = Run({})
        expect(enf).toBe('')
        expect(ro).toContain("default-src 'self'")
        expect(ro).toContain("script-src 'self' 'unsafe-inline';")
        expect(ro).toContain("frame-ancestors 'self'")
        expect(ro).toContain("object-src 'none'")
        expect(ro).not.toContain('upgrade-insecure-requests')
    })

    it('enforce sends the blocking header; off and typos behave', () => {
        expect(Run({ CSP_MODE: 'enforce' }).ro).toBe('')
        expect(Run({ CSP_MODE: 'Enforce' }).enf).toContain("default-src 'self'")
        const off = Run({ CSP_MODE: 'off' })
        expect([off.ro, off.enf]).toEqual(['', ''])
        expect(Run({ CSP_MODE: 'enforced' }).ro).toContain("default-src 'self'")
    })

    it('allows the analytics origins from the build settings', () => {
        const { ro } = Run({
            PUBLIC_UMAMI_SRC: 'https://stats.example/script.js',
            PUBLIC_PA_SRC: 'https://pa.example/js/script.js',
        })
        expect(ro).toContain("script-src 'self' 'unsafe-inline' https://stats.example https://pa.example;")
        expect(ro).toContain("connect-src 'self' https://stats.example https://plausible.io;")
        expect(Run({ PUBLIC_UMAMI_SRC: '/script.js' }).ro).toContain("script-src 'self' 'unsafe-inline';")
    })

    it('adds report-uri and refuses a quote', () => {
        expect(Run({ CSP_REPORT_URI: 'https://r.example/csp' }).ro).toMatch(/; report-uri https:\/\/r\.example\/csp$/)
        expect(() => Run({ CSP_REPORT_URI: 'https://r.example/"x' })).toThrow()
    })
})
