import {
    Rocket,
    Boxes,
    UserCog,
    Users,
    Server,
    Gamepad2,
    Blocks,
    Terminal,
    type LucideIcon,
} from 'lucide-react'

/**
 * Presentation metadata for the top-level documentation sections.
 *
 * Deliberately only the two things that cannot be read off the content itself:
 * the **icon** (a React component, which frontmatter cannot hold) and the
 * **order** (folders sort alphabetically otherwise, which would open the docs
 * on the API reference). Everything else — the section's title, its blurb, its
 * children — comes from `<section>/index.mdx`, so a section is renamed or
 * translated by editing that file and nothing here.
 *
 * A folder with no entry here still renders; it just sorts last with no icon.
 * That is intentional — adding a section should not require a code change to
 * become visible, only to become pretty.
 */
export type SectionMeta = {
    icon: LucideIcon
    order: number
}

export const SECTION_META: Record<string, SectionMeta> = {
    // The reading order of a first visit: what this is, what lives in it, then
    // the surfaces you configure, then the two subsystems with the most
    // surprising behaviour, and the machine-readable reference last.
    start: { icon: Rocket, order: 10 },
    content: { icon: Boxes, order: 20 },
    account: { icon: UserCog, order: 30 },
    community: { icon: Users, order: 40 },
    servers: { icon: Server, order: 50 },
    parties: { icon: Gamepad2, order: 60 },
    godot: { icon: Blocks, order: 65 },
    api: { icon: Terminal, order: 70 },
}

export function sectionMeta(slug: string): SectionMeta | undefined {
    return SECTION_META[slug]
}
