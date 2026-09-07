import type { ReactNode } from 'react'
import {
    Badge,
    CalloutBlock,
    FeatureCard,
    type CalloutTone,
} from '@modcommunity/shared'
import { isDocsPath, mainUrl } from '../../lib/site'

/**
 * The component vocabulary an `.mdx` documentation page can use.
 *
 * Handed to `<Content components={MDX_COMPONENTS} />` rather than imported at
 * the top of every page, so a doc file is prose with a few tags in it and never
 * a list of imports. That matters more than it sounds: the moment a writer has
 * to remember which of eleven components to import to add a note, they stop
 * adding notes and write a bold paragraph instead.
 *
 * All of these render at build time — none carries a `client:*` directive — so
 * a page of twenty callouts and six endpoint blocks still ships zero JavaScript
 * for them.
 *
 * The set is deliberately small. Anything expressible as Markdown (tables,
 * lists, emphasis, code fences) stays Markdown; a component earns its place
 * only when it encodes something the docs need to be CONSISTENT about — the
 * shape of an endpoint, the meaning of a tone, what a required parameter looks
 * like.
 */

/* ------------------------------------------------------------------ Callout */

/**
 * An aside. `tone` is meaning, not colour: `warning` is "you can lose data or
 * get a 403 here", `danger` is "this is irreversible", `info` is context.
 */
function Callout({
    type = 'info',
    title,
    children,
}: {
    type?: CalloutTone
    title?: string
    children: ReactNode
}) {
    return (
        <CalloutBlock tone={type} title={title} className="my-6">
            {children}
        </CalloutBlock>
    )
}

/* ----------------------------------------------------------------- Endpoint */

const METHOD_TONE: Record<string, string> = {
    GET: 'bg-success/15 text-success border-success/30',
    POST: 'bg-accent/15 text-accent border-accent/30',
    PUT: 'bg-warning/15 text-warning border-warning/30',
    PATCH: 'bg-warning/15 text-warning border-warning/30',
    DELETE: 'bg-danger/15 text-danger border-danger/30',
}

/**
 * The header of one API route: method, path, and what it needs to be allowed.
 *
 * The `auth` and `scope` props are not decoration — on this API the answer to
 * "why did I get a 403" is almost always one of the two, and putting them in
 * the same place on every endpoint is what lets a reader check them without
 * reading the prose underneath.
 */
function Endpoint({
    method,
    path,
    auth,
    scope,
    children,
}: {
    method: string
    path: string
    /** What kind of credential this route accepts. Omit for "none needed". */
    auth?: string
    /** Required scope / permission, when the credential also has to carry one. */
    scope?: string
    children?: ReactNode
}) {
    const upper = method.toUpperCase()

    return (
        <div className="my-6 overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-secondary px-4 py-3">
                <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${
                        METHOD_TONE[upper] ?? METHOD_TONE.GET
                    }`}
                >
                    {upper}
                </span>
                {/*
                    `break-all`, not `truncate`: an endpoint path is the one
                    piece of an API doc a reader will retype by hand, so it has
                    to be readable in full at 320px even if it wraps ugly.
                */}
                <code className="min-w-0 break-all font-mono text-sm text-foreground">
                    {path}
                </code>

                <span className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5">
                    {auth && (
                        <Badge tone="outline" size="sm">
                            {auth}
                        </Badge>
                    )}
                    {scope && (
                        <Badge tone="accent" size="sm">
                            {scope}
                        </Badge>
                    )}
                </span>
            </div>

            {children && (
                <div className="docs-endpoint-body px-4 py-3 text-sm text-muted">
                    {children}
                </div>
            )}
        </div>
    )
}

/* ------------------------------------------------------------------- Params */

/**
 * A parameter / field list.
 *
 * A definition list rather than a Markdown table because the third column is
 * always prose — often several sentences with a link and a code sample in it —
 * and a table forces that into a cell that is either 12 characters wide or the
 * width of the page. The name / type / required triple still lines up, which is
 * the only part anyone scans.
 */
function Params({ children }: { children: ReactNode }) {
    return (
        <dl className="my-6 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {children}
        </dl>
    )
}

function Param({
    name,
    type,
    required,
    default: fallback,
    children,
}: {
    name: string
    type?: string
    /**
     * Tri-state on purpose. `true` renders REQUIRED, `false` renders OPTIONAL,
     * and **omitting it renders neither** — because this list is also used to
     * explain things that are not parameters at all (a usage-policy answer, a
     * visibility flag), and stamping "optional" on those says something untrue
     * about a field nobody is passing anywhere.
     */
    required?: boolean
    default?: string
    children?: ReactNode
}) {
    /*
     * A name with a space in it is PROSE, not an identifier — this list doubles
     * as a labelled-block layout ("The party queue", "Somebody adds it"), and
     * setting those in mono makes a sentence fragment look like a symbol the
     * reader is supposed to type somewhere.
     */
    const isIdentifier = !/\s/.test(name)

    return (
        <div className="px-4 py-3">
            <dt className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span
                    className={
                        isIdentifier
                            ? 'font-mono text-sm font-semibold text-foreground'
                            : 'font-pjs text-sm font-semibold text-foreground'
                    }
                >
                    {name}
                </span>
                {type && (
                    <span className="font-mono text-xs text-accent">{type}</span>
                )}
                {required === true && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-danger">
                        required
                    </span>
                )}
                {required === false && (
                    <span className="text-xs uppercase tracking-wide text-muted">
                        optional
                    </span>
                )}
                {fallback !== undefined && (
                    <span className="text-xs text-muted">
                        default <code className="font-mono">{fallback}</code>
                    </span>
                )}
            </dt>
            {children && (
                <dd className="docs-param-body mt-1.5 text-sm text-muted">
                    {children}
                </dd>
            )}
        </div>
    )
}

/* -------------------------------------------------------------------- Cards */

/**
 * The grid a section index uses to point at its own pages.
 *
 * `@2xl` / `@4xl`, not `md` / `lg` — this renders inside the article column,
 * which is narrower than the viewport by the docs rail plus the shared icon
 * rail. Viewport breakpoints here produce three columns in a space wide enough
 * for two, which is the exact bug website-processing's CLAUDE.md documents.
 */
function Cards({ children }: { children: ReactNode }) {
    return (
        <div className="docs-cards my-6 grid gap-4 @2xl:grid-cols-2">
            {children}
        </div>
    )
}

function Card({
    title,
    href,
    children,
}: {
    title: string
    href?: string
    children?: ReactNode
}) {
    return (
        <FeatureCard title={title} href={href}>
            {children}
        </FeatureCard>
    )
}

/* ------------------------------------------------------------------- Chips */

/** A row of scope / permission chips, for "this route needs one of these". */
function Scopes({ list }: { list: string }) {
    return (
        <span className="my-1 inline-flex flex-wrap gap-1.5">
            {list
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((scope) => (
                    <Badge key={scope} tone="accent" size="sm">
                        <code className="font-mono">{scope}</code>
                    </Badge>
                ))}
        </span>
    )
}

/* ------------------------------------------------------------------ Related */

/** "Where to go next" — a short list of links closing a page. */
function Related({
    title = 'Related',
    children,
}: {
    title?: string
    children: ReactNode
}) {
    return (
        <aside className="my-8 rounded-xl border border-border bg-surface-secondary p-5">
            <p className="mb-2 font-pjs text-sm font-semibold text-foreground">
                {title}
            </p>
            <div className="docs-related text-sm text-muted">{children}</div>
        </aside>
    )
}

/**
 * Plain Markdown links, `[the site](/mods)`.
 *
 * The shell's links are absolutized by `localeLink`, but prose links never go
 * near it — MDX renders them straight to `<a>`. On a docs-subdomain deploy that
 * left them resolving against the docs origin, so a link out to the app pointed
 * at a page this host does not serve.
 *
 * Docs paths stay relative (they ARE this host), as do anchors and anything
 * external. On a `/learn`-on-the-main-domain deploy `mainUrl` is a no-op and
 * this whole component is a pass-through.
 *
 * Deliberately NOT localized, matching how prose links behave today: a docs
 * link written `/learn/api` sends every reader to the English page regardless
 * of the locale they are reading in. Worth fixing, but separately — it changes
 * 291 links across the corpus and is not what this component is for.
 */
function A({ href, children, ...rest }: { href?: string; children?: ReactNode }) {
    const external = !href || !href.startsWith('/') || href.startsWith('//')
    const resolved = external || isDocsPath(href) ? href : mainUrl(href)

    return (
        <a href={resolved} {...rest}>
            {children}
        </a>
    )
}

export const MDX_COMPONENTS = {
    a: A,
    Callout,
    Endpoint,
    Params,
    Param,
    Cards,
    Card,
    Scopes,
    Related,
    Badge,
}
