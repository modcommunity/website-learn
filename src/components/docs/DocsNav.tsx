import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, BookOpen } from 'lucide-react'
import DocsSearch from './DocsSearch'
import DocsTree from './DocsTree'
import type { NavNode } from '../../docs/mount'
import { getT } from '../../i18n/t'

/**
 * The docs rail: search on top, table of contents beneath — and, below the
 * breakpoint where the rail can exist, the disclosure that opens the same
 * panel over the page.
 *
 * One island rather than three so the mobile toggle and the tree share state,
 * and so a narrow viewport hydrates one component instead of a hidden desktop
 * copy plus a visible mobile one. The panel markup is rendered exactly once and
 * moved by CSS, so there is no second tree to keep in sync.
 *
 * Everything here is sized with container queries (`@4xl:`), not `lg:`, because
 * this sits inside `<main>`, whose width already differs from the viewport's by
 * the shared icon rail. See website-processing's CLAUDE.md for the full story —
 * it is the same trap, and the docs shell has two more columns to get wrong.
 */
export default function DocsNav({
    tree,
    activePath,
    locale = 'en',
}: {
    tree: NavNode[]
    activePath: string
    locale?: string
}) {
    const t = getT(locale)
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Mobile / narrow: the trigger. Hidden once the rail fits. */}
            {/*
                `basis-full`: its own line in the wrapping shell row, above the
                article rather than beside it.

                `min-w-0`: without it the bar keeps its automatic minimum size —
                the trigger's label plus the search box's own minimum — which at
                320px is 312px against a 288px column, and the whole document
                scrolls 8px sideways. The two children below say how the deficit
                is paid: the trigger keeps its label, the search box gives up
                width.
            */}
            <div className="flex min-w-0 basis-full items-center gap-2 @4xl:hidden">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 font-pjs text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:border-accent/40"
                >
                    <Menu className="h-4 w-4" />
                    {t('docs.nav.browse')}
                </button>

                <div className="min-w-0 flex-1">
                    <DocsSearch locale={locale} />
                </div>
            </div>

            {/*
                Narrow: the panel, over the page — and portalled to <body>.

                It cannot render in place. `Layout.astro` gives <main> a
                `relative z-20`, which makes it a stacking context, so a `fixed`
                child of it is trapped inside that context however high its own
                z-index goes. The shared <Header/> is `z-40` on the OUTSIDE, so
                it painted over the drawer's own header row — the close button
                and the title were behind the site nav.

                The portal only ever runs after a click, so `document` is
                guaranteed and there is no SSR branch to guard.
            */}
            {open && createPortal(
                <div className="fixed inset-0 z-[90] flex">
                    <button
                        type="button"
                        aria-label={t('docs.nav.close')}
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
                    />

                    <div className="relative flex h-full w-[19rem] max-w-[85vw] flex-col border-r border-border bg-surface">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <span className="flex items-center gap-2 font-pjs text-sm font-semibold text-foreground">
                                <BookOpen className="h-4 w-4 text-accent" />
                                {t('docs.nav.label')}
                            </span>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label={t('docs.nav.close')}
                                className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-3">
                            <DocsTree
                                tree={tree}
                                activePath={activePath}
                                locale={locale}
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Wide: the rail itself. `sticky`, with its own scroll, so a long
                section list scrolls independently of the page it indexes. */}
            <aside className="hidden shrink-0 @4xl:block @4xl:w-[16.5rem]">
                <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8">
                    <DocsSearch locale={locale} className="mb-4" />
                    <DocsTree
                        tree={tree}
                        activePath={activePath}
                        locale={locale}
                    />
                </div>
            </aside>
        </>
    )
}
