import { useEffect, useMemo, useState } from 'react'
import { getT } from '../../i18n/t'
import { track } from '../../lib/umami'

export type TocHeading = {
    depth: number
    slug: string
    text: string
}

/**
 * The "On this page" rail — the right-hand column of the docs shell.
 *
 * An island rather than static markup because it scroll-spies: the entry for
 * the section you are reading is highlighted as you go. Astro hands it the
 * headings `render()` already extracted, so the list itself costs no extra
 * parsing on the client.
 *
 * Only `h2` and `h3` are listed. `h1` is the page title (there is exactly one,
 * and it is what the breadcrumb already says), and `h4`-and-deeper in these
 * documents are field names inside a section — listing them turns a navigation
 * aid into a second copy of the page.
 */
export default function DocsToc({
    headings,
    locale = 'en',
    className = '',
}: {
    headings: TocHeading[]
    locale?: string
    className?: string
}) {
    const t = getT(locale)

    const items = useMemo(
        () => headings.filter((h) => h.depth === 2 || h.depth === 3),
        [headings]
    )

    const [active, setActive] = useState<string | null>(null)

    useEffect(() => {
        if (items.length === 0) return

        const targets = items
            .map((h) => document.getElementById(h.slug))
            .filter((el): el is HTMLElement => Boolean(el))

        if (targets.length === 0) return

        /*
         * The observation band is the top ~30% of the viewport, not the whole
         * of it. With a full-height band, a long section and the short one after
         * it are both "intersecting" for most of the scroll, and the highlight
         * lands on whichever the observer reported last — which reads as the
         * marker jumping ahead of the text. Watching a thin strip near the top
         * makes "active" mean "the heading you most recently scrolled past",
         * which is what a reader expects it to mean.
         */
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

                if (visible.length > 0) {
                    setActive(visible[0]!.target.id)
                    return
                }

                // Nothing in the band: keep the last heading above the fold, so
                // scrolling through a long section does not clear the highlight.
                const above = targets
                    .filter((el) => el.getBoundingClientRect().top < 120)
                    .pop()

                if (above) setActive(above.id)
            },
            { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
        )

        for (const el of targets) observer.observe(el)

        return () => observer.disconnect()
    }, [items])

    if (items.length === 0) return null

    return (
        <nav
            aria-label={t('docs.toc.label')}
            className={`font-pjs text-sm ${className}`}
        >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {t('docs.toc.label')}
            </p>

            <ul className="space-y-0.5 border-l border-border">
                {items.map((h, i) => {
                    const isActive = active === h.slug

                    return (
                        <li key={h.slug}>
                            <a
                                href={`#${h.slug}`}
                                aria-current={isActive ? 'location' : undefined}
                                /*
                                 * A same-page `#hash` jump produces no
                                 * pageview and no request, so this control is
                                 * completely invisible without the event.
                                 *
                                 * Depth and position, not `h.text`: "are
                                 * readers reaching for sub-sections or only
                                 * top-level ones" is what decides how deep to
                                 * render the list, and the text is translated
                                 * prose that would be nine rows per heading.
                                 */
                                onClick={() =>
                                    track('docs_toc_click', {
                                        slug: h.slug,
                                        depth: h.depth,
                                        index: i + 1,
                                        of: items.length,
                                    })
                                }
                                className={`-ml-px block border-l py-1 pr-2 transition-colors ${
                                    h.depth === 3 ? 'pl-6' : 'pl-3'
                                } ${
                                    isActive
                                        ? 'border-accent font-medium text-accent'
                                        : 'border-transparent text-muted hover:border-border-selected hover:text-foreground'
                                }`}
                            >
                                {h.text}
                            </a>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
