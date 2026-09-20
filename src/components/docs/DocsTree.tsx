import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { SECTION_META } from '../../docs/sections'
import type { NavNode } from '../../docs/mount'
import { track } from '../../lib/umami'
import { getT } from '../../i18n/t'

/**
 * The documentation table of contents — the left rail of the docs shell.
 *
 * This is a SECOND sidebar. The shared `<Sidebar/>` (the icon rail from
 * website-city) stays where it is, listing the app's pillars; this one lists
 * the docs and sits beside it. They are not merged because they answer
 * different questions — "where else can I go on this site" versus "where am I
 * in this document" — and a reader deep in the API reference needs the second
 * one pinned open while the first stays a 4rem rail.
 *
 * Props are all plain data: Astro serializes island props to JSON, so the tree
 * arrives as {@link NavNode}s and the icons are looked up here from the section
 * slug rather than passed in as components.
 */
export default function DocsTree({
    tree,
    activePath,
    locale = 'en',
    /** Rendered inside the panel above the tree — the search trigger. */
    className = '',
}: {
    tree: NavNode[]
    activePath: string
    locale?: string
    className?: string
}) {
    const t = getT(locale)

    /**
     * Which sections are open. Seeded with the section the reader is in, and
     * with every ancestor of the current page, so arriving from a search result
     * or an external link shows you where you landed rather than a folded list.
     */
    const initiallyOpen = useMemo(() => {
        const open = new Set<string>()
        const segments = activePath.split('/').filter(Boolean)

        let acc = ''
        for (const seg of segments) {
            acc = acc ? `${acc}/${seg}` : seg
            open.add(acc)
        }

        return open
    }, [activePath])

    const [open, setOpen] = useState<Set<string>>(initiallyOpen)

    const toggle = (path: string) =>
        setOpen((prev) => {
            const next = new Set(prev)
            if (next.has(path)) next.delete(path)
            else next.add(path)

            /*
             * The section's PATH, never `navLabel` — the label is translated,
             * and one section must not become nine rows in Umami.
             *
             * Whether the tree is opened at all is the question that decides
             * how much of it to render expanded by default, and there is no
             * other trace of it: expanding a section navigates nowhere.
             */
            track('docs_nav_section_toggle', {
                section: path,
                open: next.has(path),
            })

            return next
        })

    return (
        <nav
            aria-label={t('docs.nav.label')}
            className={`font-pjs text-sm ${className}`}
        >
            <ul className="space-y-1">
                {tree.map((section) => (
                    <TreeSection
                        key={section.path}
                        node={section}
                        activePath={activePath}
                        open={open}
                        onToggle={toggle}
                        t={t}
                    />
                ))}
            </ul>
        </nav>
    )
}

function TreeSection({
    node,
    activePath,
    open,
    onToggle,
    t,
}: {
    node: NavNode
    activePath: string
    open: Set<string>
    onToggle: (path: string) => void
    t: ReturnType<typeof getT>
}) {
    const Icon = SECTION_META[node.path]?.icon
    const isOpen = open.has(node.path)
    const active = activePath === node.path
    // The section header lights up for anything inside it, so the rail always
    // shows which part of the docs you are in even with the section folded.
    const within = activePath === node.path || activePath.startsWith(`${node.path}/`)

    return (
        <li>
            <div
                className={`flex items-center gap-1 rounded-lg pr-1 transition-colors ${
                    within ? 'bg-surface-secondary' : 'hover:bg-surface-secondary/60'
                }`}
            >
                <a
                    href={node.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() =>
                        track('docs_nav_link', {
                            href: node.href,
                            level: 'section',
                        })
                    }
                    className={`flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 font-semibold ${
                        within ? 'text-foreground' : 'text-muted hover:text-foreground'
                    }`}
                >
                    {Icon && (
                        <Icon
                            className={`h-4 w-4 shrink-0 ${within ? 'text-accent' : ''}`}
                        />
                    )}
                    <span className="truncate">{node.navLabel}</span>
                </a>

                {node.children.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onToggle(node.path)}
                        aria-expanded={isOpen}
                        aria-label={
                            isOpen
                                ? t('docs.nav.collapse', { section: node.navLabel })
                                : t('docs.nav.expand', { section: node.navLabel })
                        }
                        className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                        <ChevronRight
                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                isOpen ? 'rotate-90' : ''
                            }`}
                        />
                    </button>
                )}
            </div>

            {node.children.length > 0 && isOpen && (
                <ul className="mt-0.5 ml-[1.05rem] space-y-0.5 border-l border-border pl-2">
                    {node.children.map((child) => (
                        <TreeLeaf
                            key={child.path}
                            node={child}
                            activePath={activePath}
                            open={open}
                            onToggle={onToggle}
                            t={t}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
}

/**
 * A page inside a section — and, when it has children of its own, a nested
 * group. The API reference is three deep (`api` → `content` → `authentication`)
 * and flattening it would put twenty sibling leaves under one heading.
 */
function TreeLeaf({
    node,
    activePath,
    open,
    onToggle,
    t,
}: {
    node: NavNode
    activePath: string
    open: Set<string>
    onToggle: (path: string) => void
    t: ReturnType<typeof getT>
}) {
    const active = activePath === node.path
    const within = active || activePath.startsWith(`${node.path}/`)
    const isOpen = open.has(node.path)
    const hasChildren = node.children.length > 0

    return (
        <li>
            <div className="flex items-center gap-1">
                <a
                    href={node.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() =>
                        track('docs_nav_link', { href: node.href, level: 'page' })
                    }
                    className={`min-w-0 flex-1 rounded-md px-2 py-1 transition-colors ${
                        active
                            ? 'bg-accent/12 font-medium text-accent'
                            : within
                              ? 'text-foreground'
                              : 'text-muted hover:bg-surface-secondary/60 hover:text-foreground'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <span className="truncate">{node.navLabel}</span>
                        {node.badge && <Ribbon badge={node.badge} t={t} />}
                    </span>
                </a>

                {hasChildren && (
                    <button
                        type="button"
                        onClick={() => onToggle(node.path)}
                        aria-expanded={isOpen}
                        aria-label={
                            isOpen
                                ? t('docs.nav.collapse', { section: node.navLabel })
                                : t('docs.nav.expand', { section: node.navLabel })
                        }
                        className="rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                        <ChevronRight
                            className={`h-3 w-3 transition-transform duration-200 ${
                                isOpen ? 'rotate-90' : ''
                            }`}
                        />
                    </button>
                )}
            </div>

            {hasChildren && isOpen && (
                <ul className="mt-0.5 ml-2 space-y-0.5 border-l border-border pl-2">
                    {node.children.map((child) => (
                        <TreeLeaf
                            key={child.path}
                            node={child}
                            activePath={activePath}
                            open={open}
                            onToggle={onToggle}
                            t={t}
                        />
                    ))}
                </ul>
            )}
        </li>
    )
}

const RIBBON_TONE: Record<string, string> = {
    new: 'bg-success/15 text-success',
    updated: 'bg-accent/15 text-accent',
    draft: 'bg-warning/15 text-warning',
}

function Ribbon({ badge, t }: { badge: string; t: ReturnType<typeof getT> }) {
    return (
        <span
            className={`shrink-0 rounded px-1 py-px text-[0.625rem] font-semibold uppercase tracking-wide ${
                RIBBON_TONE[badge] ?? RIBBON_TONE.updated
            }`}
        >
            {t(`docs.badge.${badge}`)}
        </span>
    )
}
