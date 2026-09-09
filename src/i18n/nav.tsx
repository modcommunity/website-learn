import {
    BookOpen,
    Boxes,
    Cog,
    Hammer,
    Server,
    Gamepad2,
    Images,
    Map,
    Search,
    Compass,
    Users,
    Network,
    NotebookPen,
    FolderKey,
    Package,
    Plus,
    User,
    Newspaper,
    Group,
    Puzzle,
    Activity,
    Joystick,
    Trophy,
    FolderTree,
    MessageSquare,
    MessagesSquare,
    UserCheck,
    Lightbulb,
    Mail,
    Bug,
    ScrollText,
} from 'lucide-react'
// lucide dropped brand marks, so Discord stays on react-icons — website-city
// makes the same exception.
import { FaDiscord } from 'react-icons/fa6'
import type { NavItem, NavLeaf, NavSection, FooterColumn } from '@modcommunity/shared'
import type { TFunc } from './t'

// All destinations live on website-city, served under the same domain, so
// internal links are plain relative paths.
const DISCORD = 'https://discord.moddingcommunity.com'
// Our own roadmap board on website-city, not the GitHub milestones page it used
// to be — city moved to it and this catalogue mirrors city.
const ROADMAP = '/roadmap'
const FEEDBACK = '/feedback'
// City's own changelog (what shipped) and bug tracker (defect reports, which
// used to be a feedback type). Both sit beside the roadmap and the feedback
// board in city's Resources menu and in its footer, so they do here too.
const CHANGELOG = '/changelog'
const BUGS = '/bugs'
// City's own contact page (`CONTACT_URL` there), not a mailto — the page
// carries the address, the Discord invite and the staff directory.
const CONTACT = '/contact'
// City's status page — incidents and live checks, under the bug tracker in its
// Resources menu.
const STATUS = '/status'
/*
 * The documentation — THIS site.
 *
 * City and website-processing now carry the same leaf, in the same slot at the
 * top of Resources and with the same words, so the three menus match. What
 * differs is only the href: they point at `https://docs.moddingcommunity.com`,
 * the docs' own hostname, while here it stays the relative `/learn` this build
 * actually serves, because a docs site should not leave its own origin to reach
 * itself. None of the three marks the leaf `external` any more — it navigates
 * in place everywhere.
 */
const DOCS = '/learn'

/**
 * Header primary nav — a mirror of website-city's `PRIMARY_NAV`: the same four
 * top-level entries, in the same order, with the same icons and the same
 * sub-labels. Labels/descriptions come from `nav.*`, ported verbatim from
 * city's `locales/<lang>/nav.json`, so both headers read identically in every
 * locale.
 *
 * The bar is four entries wide, exactly as city's is: everything you can BROWSE
 * under Explore, everywhere the community talks to us under Community, what we
 * publish back at them under Resources, and the Blog on its own. Resources is
 * hrefless (a dropdown-only trigger) because it has no page of its own; Explore
 * points at `/explore`, city's editorial front across every content type.
 *
 * The pillars no longer carry their sidebar section as a dropdown — city
 * dropped that, so the per-pillar Add / Browse / My X routes are reached from
 * the landing page or the rail, which still lists every section in full. That
 * is also why nothing here is signed-in-only any more: the auth hint still
 * shapes the RAIL (see `buildVisibleSidebarSections`), just not this.
 *
 * If city's PRIMARY_NAV changes, change this with it — that config is the
 * source of truth. That includes the ORDER of the pillars, which had drifted:
 * this menu led with mods and put collections ahead of communities, so the front
 * page's own index of the same destinations was numbered differently from the
 * menu above it.
 */
export function buildNav(t: TFunc): NavItem[] {
    return [
        {
            // `/explore` is city's editorial front over every content type at
            // once. This pillar used to point at the app browser, on the
            // grounds that a page called Explore would only duplicate the
            // landing pages in the menu below; city has since built one that
            // does not — it is a curated look ACROSS the types each leaf here
            // covers one of.
            label: t('nav.explore.label'),
            href: '/explore',
            icon: Compass,
            desc: t('nav.explore.desc'),
            children: [
                {
                    // The pillar's own destination, repeated as a leaf: a hover
                    // menu hides the fact that the heading is itself a link.
                    label: t('nav.explore.label'),
                    href: '/explore',
                    icon: Compass,
                    desc: t('nav.explore.desc'),
                },
                {
                    label: t('nav.apps.label'),
                    href: '/apps',
                    icon: Boxes,
                    desc: t('nav.apps.desc'),
                },
                {
                    label: t('nav.mods.label'),
                    href: '/mods',
                    icon: Hammer,
                    desc: t('nav.mods.desc'),
                },
                {
                    label: t('nav.servers.label'),
                    href: '/servers',
                    icon: Server,
                    desc: t('nav.servers.desc'),
                },
                {
                    label: t('nav.assets.label'),
                    href: '/assets',
                    icon: Cog,
                    desc: t('nav.assets.desc'),
                },
                {
                    label: t('nav.collections.label'),
                    href: '/collections',
                    icon: Group,
                    desc: t('nav.collections.desc'),
                },
                {
                    label: t('nav.communities.label'),
                    href: '/communities',
                    icon: Users,
                    desc: t('nav.communities.desc'),
                },
                {
                    label: t('nav.articles.label'),
                    href: '/articles',
                    icon: Newspaper,
                    desc: t('nav.articles.desc'),
                },
                {
                    // Media has no landing page of its own — the browser IS the
                    // page — so this points at `/media/browse`, as city's leaf
                    // does, rather than at a `/media` that would 404.
                    label: t('nav.media.label'),
                    href: '/media/browse',
                    icon: Images,
                    desc: t('nav.media.desc'),
                },
                {
                    label: t('nav.parties.label'),
                    href: '/parties',
                    icon: Gamepad2,
                    desc: t('nav.parties.desc'),
                },
                {
                    label: t('nav.groups.label'),
                    href: '/groups',
                    icon: Network,
                    desc: t('nav.groups.desc'),
                },
            ],
        },
        {
            // The people pillar, and the places the community talks TO us.
            label: t('nav.community.label'),
            href: '/community',
            icon: Users,
            desc: t('nav.community.desc'),
            children: [
                {
                    // The merged feed. It sits here rather than under Explore
                    // because it is a record of what MEMBERS are doing and
                    // saying, which is what every other leaf in this menu is
                    // too — Explore is the catalogue, this is the conversation.
                    label: t('nav.feed.label'),
                    href: '/feed',
                    icon: Compass,
                    desc: t('nav.feed.desc'),
                },
                {
                    label: t('nav.discord.label'),
                    href: DISCORD,
                    icon: FaDiscord,
                    desc: t('nav.discord.desc'),
                    external: true,
                },
                {
                    label: t('nav.roadmap.label'),
                    href: ROADMAP,
                    icon: Map,
                    desc: t('nav.roadmap.desc'),
                },
                {
                    // City's own feedback board — suggestions and votes. Beside
                    // the roadmap on purpose: one says what is planned, the
                    // other is where people ask for things to be.
                    label: t('nav.feedback.label'),
                    href: FEEDBACK,
                    icon: Lightbulb,
                    desc: t('nav.feedback.desc'),
                },
                {
                    // The site-wide board: the conversations that are not about
                    // one mod or server.
                    label: t('nav.discussions.label'),
                    href: '/discussions',
                    icon: MessagesSquare,
                    desc: t('nav.discussions.desc'),
                },
                {
                    // City's contact page — email, Discord and the staff
                    // directory. Lives on website-city like everything else
                    // under this menu, so a plain relative path.
                    label: t('nav.contact.label'),
                    href: CONTACT,
                    icon: Mail,
                    desc: t('nav.contact.desc'),
                },
            ],
        },
        {
            // Dropdown-only, like Explore. What it holds is the reporting side
            // of the site — what is broken, what we shipped, and whether
            // anything is down right now, in the order those are read in.
            label: t('nav.resources.label'),
            icon: FolderKey,
            desc: t('nav.resources.desc'),
            children: [
                {
                    // The documentation, first: it is the entry in this menu a
                    // reader wants BEFORE the ones about things being broken.
                    label: t('nav.docs.label'),
                    href: DOCS,
                    icon: BookOpen,
                    desc: t('nav.docs.desc'),
                },
                {
                    // The bug tracker, which is where defect reports go now:
                    // they were previously a feedback type, and a report that
                    // needs steps to reproduce, a severity and a confirmed queue
                    // has nothing in common with "please add dark mode".
                    label: t('nav.bugs.label'),
                    href: BUGS,
                    icon: Bug,
                    desc: t('nav.bugs.desc'),
                },
                {
                    // The site's own changelog — what actually shipped.
                    label: t('nav.changelog.label'),
                    href: CHANGELOG,
                    icon: ScrollText,
                    desc: t('nav.changelog.desc'),
                },
                {
                    // The status page, under the bug tracker on purpose:
                    // somebody about to report that the site is broken should
                    // pass "is it already known" on the way there.
                    label: t('nav.status.label'),
                    href: STATUS,
                    icon: Activity,
                    desc: t('nav.status.desc'),
                },
            ],
        },
        {
            // City's `BLOG_URL`. There is no `/blog` route in THIS repo — the
            // blog is a website-city page, and city's Next.js build serves it
            // without a trailing slash, so a `/blog/` here would only earn a
            // 308 on every click.
            label: t('nav.blog.label'),
            href: '/blog',
            icon: NotebookPen,
            desc: t('nav.blog.desc'),
        },
    ]
}

/**
 * Footer quick-link columns — a mirror of website-city's `FOOTER_LINKS`
 * (`src/app/_components/ui/shell/nav-config.ts`), which is the source of truth
 * for the columns, their entries and their order. Labels come from `footer.*`,
 * ported verbatim from city's `locales/<lang>/footer.json`, so both footers read
 * identically in every locale.
 *
 * The socials row and the brand mark beside these columns are the shared
 * <Footer/>'s own defaults, which already carry city's accounts and hover
 * colours — so neither is passed here.
 *
 * If city's FOOTER_LINKS changes, change this with it.
 */
export function buildFooterColumns(t: TFunc): FooterColumn[] {
    return [
        {
            heading: t('footer.headings.explore'),
            links: [
                { label: t('footer.links.apps'), href: '/apps' },
                { label: t('footer.links.assets'), href: '/assets' },
                { label: t('footer.links.mods'), href: '/mods' },
                { label: t('footer.links.servers'), href: '/servers' },
                { label: t('footer.links.parties'), href: '/parties' },
                {
                    label: t('footer.links.communities'),
                    href: '/communities',
                },
                {
                    label: t('footer.links.collections'),
                    href: '/collections',
                },
                { label: t('footer.links.groups'), href: '/groups' },
                // The member directory, not the column heading above it — city
                // names this link "Community" as well.
                { label: t('footer.links.community'), href: '/community' },
                { label: t('footer.links.banners'), href: '/banners' },
            ],
        },
        {
            heading: t('footer.headings.community'),
            links: [
                {
                    label: t('footer.links.discord'),
                    href: DISCORD,
                    external: true,
                },
                // City's `BLOG_URL` — a website-city page served without a
                // trailing slash. See the header entry above.
                { label: t('footer.links.blog'), href: '/blog' },
                {
                    label: t('footer.links.activity'),
                    href: '/community/activity',
                },
                {
                    label: t('footer.links.discussions'),
                    href: '/discussions',
                },
                { label: t('footer.links.media'), href: '/media/browse' },
                { label: t('footer.links.contact'), href: CONTACT },
            ],
        },
        {
            /*
             * The header's Resources menu, in the footer.
             *
             * Everything under that menu was reachable from the header and from
             * nowhere else — the changelog, the roadmap, the feedback board and
             * the bug tracker are the four pages a reader goes looking for once
             * they want to know what shipped, what is planned, ask for
             * something or report something. The menu's other entries (Discord,
             * blog, community, discussions, banners, contact) are already in the
             * columns beside this one.
             */
            heading: t('footer.headings.resources'),
            links: [
                // The documentation. Same divergence from city as the header
                // entry above, and first here for the same reason.
                { label: t('footer.links.docs'), href: DOCS },
                { label: t('footer.links.changelog'), href: CHANGELOG },
                { label: t('footer.links.roadmap'), href: ROADMAP },
                { label: t('footer.links.feedback'), href: FEEDBACK },
                { label: t('footer.links.bugs'), href: BUGS },
                { label: t('footer.links.status'), href: STATUS },
            ],
        },
        {
            heading: t('footer.headings.legal'),
            links: [
                { label: t('footer.links.tos'), href: '/tos' },
                { label: t('footer.links.privacy'), href: '/privacy-policy' },
                { label: t('footer.links.licenses'), href: '/licenses' },
            ],
        },
    ]
}

/**
 * A sidebar leaf, plus the one thing the shared `NavLeaf` has no notion of:
 * whether it is a signed-in-only destination.
 *
 * website-city hides those from signed-out visitors using the real session.
 * We only have the non-HttpOnly `tmc_auth` hint cookie (see `AccountButton`),
 * which is enough — the flag is read in `SiteSidebar` and the leaves are
 * dropped before the list ever reaches the shared <Sidebar>.
 */
export type SidebarLeaf = NavLeaf & { requiresAuth?: boolean }

export type SidebarSection = Omit<NavSection, 'items'> & {
    items: SidebarLeaf[]
}

/**
 * Primary sidebar sections — a mirror of website-city's `SIDEBAR_SECTIONS`
 * (`src/app/_components/ui/shell/nav-config.ts`), which is the source of truth
 * for the entries, their order and their icons. Labels come from `rail.*`,
 * ported verbatim from city's `locales/<lang>/nav.json`.
 *
 * Three deliberate differences from city, all of them structural rather than
 * editorial:
 *
 * 1. **No Admin section.** City role-gates it to staff; the `tmc_auth` cookie
 *    carries a yes/no and no role, so there is nothing to gate on here. Staff
 *    reach `/admin` from the app.
 * 2. **"Add" leaves are plain links to the dedicated `/{plural}/add` pages.**
 *    In city they are buttons that open a create pop-up in place. This is a
 *    static build with no session and no tRPC client, so a pop-up asking for a
 *    name and an app has nothing to submit to — the dedicated page (which city
 *    already had behind every one of those modals) is the working destination.
 *    The same reasoning applies to the "Share your work" call-to-action, which
 *    points at `/share`.
 * 3. **No Legal section.** City has none either; ToS / Privacy / Licenses are
 *    footer links in both shells.
 */
/**
 * {@link buildSidebarSections} reduced to the plain shared contract: the
 * signed-in-only leaves are dropped for signed-out visitors and `requiresAuth`
 * — which is ours, not the shared type's — is stripped off the rest.
 *
 * Every surface that renders the rail's sections (the desktop rail, the mobile
 * drawer, the header's pillar dropdowns) goes through this, so none of them can
 * offer a destination the others hide.
 */
export function buildVisibleSidebarSections(
    t: TFunc,
    signedIn: boolean
): NavSection[] {
    return buildSidebarSections(t).map((section) => ({
        ...section,
        items: section.items
            .filter((item) => !item.requiresAuth || signedIn)
            .map(({ requiresAuth: _requiresAuth, ...leaf }) => leaf),
    }))
}

export function buildSidebarSections(t: TFunc): SidebarSection[] {
    return [
        {
            label: t('rail.sections.apps'),
            icon: Package,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/apps',
                    icon: Compass,
                    desc: t('rail.pillars.apps.overview'),
                },
                {
                    label: t('rail.items.browse'),
                    href: '/apps/browse',
                    icon: Search,
                    desc: t('rail.pillars.apps.browse'),
                },
            ],
        },
        {
            label: t('rail.sections.assets'),
            icon: Cog,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/assets',
                    icon: Compass,
                    desc: t('rail.pillars.assets.overview'),
                },
                {
                    label: t('rail.items.add'),
                    href: '/assets/add',
                    icon: Plus,
                    desc: t('rail.pillars.assets.add'),
                },
                {
                    label: t('rail.items.browse'),
                    href: '/assets/browse',
                    icon: Search,
                    desc: t('rail.pillars.assets.browse'),
                },
                {
                    label: t('rail.items.myAssets'),
                    href: '/assets/browse/?mine=1',
                    icon: User,
                    desc: t('rail.pillars.assets.mine'),
                    requiresAuth: true,
                },
            ],
        },
        {
            label: t('rail.sections.mods'),
            icon: Hammer,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/mods',
                    icon: Compass,
                    desc: t('rail.pillars.mods.overview'),
                },
                {
                    label: t('rail.items.add'),
                    href: '/mods/add',
                    icon: Plus,
                    desc: t('rail.pillars.mods.add'),
                },
                {
                    label: t('rail.items.browse'),
                    href: '/mods/browse',
                    icon: Search,
                    desc: t('rail.pillars.mods.browse'),
                },
                {
                    label: t('rail.items.myMods'),
                    href: '/mods/browse/?mine=1',
                    icon: User,
                    desc: t('rail.pillars.mods.mine'),
                    requiresAuth: true,
                },
            ],
        },
        {
            label: t('rail.sections.servers'),
            icon: Server,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/servers',
                    icon: Compass,
                    desc: t('rail.pillars.servers.overview'),
                },
                {
                    label: t('rail.items.add'),
                    href: '/servers/add',
                    icon: Plus,
                    desc: t('rail.pillars.servers.add'),
                },
                {
                    label: t('rail.items.browse'),
                    href: '/servers/browse',
                    icon: Search,
                    desc: t('rail.pillars.servers.browse'),
                },
                // Just "Maps" — it already sits under the Servers section, and
                // the maps landing page carries its own browse button.
                {
                    label: t('rail.items.maps'),
                    href: '/servers/maps',
                    icon: Map,
                    desc: t('rail.pillars.servers.maps'),
                },
                // Same reasoning as Maps: one leaf, pointing at the landing,
                // which carries its own browse button.
                {
                    label: t('rail.items.players'),
                    href: '/servers/players',
                    icon: Users,
                    desc: t('rail.pillars.servers.players'),
                },
                // The forum's Knowledgebase leaf used to sit here, and is
                // gone from city's rail too until the FAQ section replacing it
                // exists.
                {
                    label: t('rail.items.myServers'),
                    href: '/servers/browse/?mine=1',
                    icon: User,
                    desc: t('rail.pillars.servers.mine'),
                    requiresAuth: true,
                },
            ],
        },
        {
            /*
             * The play center. Sits ABOVE Parties on purpose, as it does in
             * city: a party is something you organise, and this is something
             * you press — somebody arriving to play should reach the shorter
             * path first.
             */
            label: t('rail.sections.play'),
            icon: Joystick,
            items: [
                {
                    label: t('rail.items.playCenter'),
                    href: '/play',
                    icon: Joystick,
                    desc: t('rail.pillars.play.center'),
                },
                {
                    label: t('rail.items.playGames'),
                    href: '/play/?tab=games',
                    icon: Gamepad2,
                    desc: t('rail.pillars.play.games'),
                },
                {
                    label: t('rail.items.playServers'),
                    href: '/play/?tab=servers',
                    icon: Server,
                    desc: t('rail.pillars.play.servers'),
                },
                {
                    label: t('rail.items.playLobbies'),
                    href: '/play/?tab=lobbies',
                    icon: Users,
                    desc: t('rail.pillars.play.lobbies'),
                },
            ],
        },
        {
            label: t('rail.sections.parties'),
            icon: Gamepad2,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/parties',
                    icon: Compass,
                    desc: t('rail.pillars.parties.overview'),
                },
                {
                    label: t('rail.items.add'),
                    href: '/parties/add',
                    icon: Plus,
                    desc: t('rail.pillars.parties.add'),
                },
                {
                    label: t('rail.items.browse'),
                    href: '/parties/browse',
                    icon: Search,
                    desc: t('rail.pillars.parties.browse'),
                },
                {
                    label: t('rail.items.liveParties'),
                    href: '/parties/browse/?live=live',
                    icon: Gamepad2,
                    desc: t('rail.pillars.parties.live'),
                },
                {
                    label: t('rail.items.friendParties'),
                    href: '/parties/browse/?friends=1&live=live',
                    icon: Users,
                    desc: t('rail.pillars.parties.friends'),
                    requiresAuth: true,
                },
                {
                    label: t('rail.items.myParties'),
                    href: '/parties/browse/?mine=1',
                    icon: User,
                    desc: t('rail.pillars.parties.mine'),
                    requiresAuth: true,
                },
            ],
        },
        {
            label: t('rail.sections.communities'),
            icon: Users,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/communities',
                    icon: Compass,
                },
                {
                    label: t('rail.items.add'),
                    href: '/communities/add',
                    icon: Plus,
                },
                {
                    label: t('rail.items.browse'),
                    href: '/communities/browse',
                    icon: Search,
                },
                {
                    label: t('rail.items.myCommunities'),
                    href: '/communities/browse/?mine=1',
                    icon: User,
                    requiresAuth: true,
                },
            ],
        },
        {
            label: t('rail.sections.articles'),
            icon: Newspaper,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/articles',
                    icon: Compass,
                },
                // City's `BLOG_URL` — a website-city page served without a
                // trailing slash. See the header entry above.
                {
                    label: t('rail.items.blog'),
                    href: '/blog',
                    icon: NotebookPen,
                },
                {
                    label: t('rail.items.add'),
                    href: '/articles/add',
                    icon: Plus,
                },
                {
                    label: t('rail.items.browse'),
                    href: '/articles/browse',
                    icon: Search,
                },
                {
                    label: t('rail.items.myArticles'),
                    href: '/articles/browse/?mine=1',
                    icon: User,
                    requiresAuth: true,
                },
            ],
        },
        {
            label: t('rail.sections.collections'),
            icon: Group,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/collections',
                    icon: Compass,
                },
                {
                    label: t('rail.items.add'),
                    href: '/collections/add',
                    icon: Plus,
                },
                {
                    label: t('rail.items.browse'),
                    href: '/collections/browse',
                    icon: Search,
                },
                {
                    label: t('rail.items.myCollections'),
                    href: '/collections/browse/?mine=1',
                    icon: User,
                    requiresAuth: true,
                },
            ],
        },
        {
            /*
             * The taxonomy itself. Sits between the content pillars and the
             * people one because it is what every pillar above is organized BY
             * — a reader after "co-op servers and co-op mods" is asking a
             * category question, not a mods question.
             */
            label: t('rail.sections.categories'),
            icon: FolderTree,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/categories',
                    icon: Compass,
                },
                {
                    label: t('rail.items.browse'),
                    href: '/categories/browse',
                    icon: Search,
                },
            ],
        },
        {
            label: t('rail.sections.groups'),
            icon: Users,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/groups',
                    icon: Compass,
                },
                { label: t('rail.items.add'), href: '/groups/add', icon: Plus },
                {
                    label: t('rail.items.browse'),
                    href: '/groups/browse',
                    icon: Search,
                },
                {
                    label: t('rail.items.myGroups'),
                    href: '/groups/browse/?mine=1',
                    icon: User,
                    requiresAuth: true,
                },
            ],
        },
        {
            // The people pillar. "Users" is the member directory inside it, and
            // it sits BELOW Activity — the feed is what a reader opens this
            // section for.
            label: t('rail.sections.community'),
            icon: Users,
            items: [
                {
                    label: t('rail.items.overview'),
                    href: '/community',
                    icon: Compass,
                },
                {
                    label: t('rail.items.activity'),
                    href: '/community/activity',
                    icon: Activity,
                },
                {
                    // The site-wide board. It sits in the people pillar rather
                    // than under any content type because that is what it is
                    // for: the conversations that are not about one mod or
                    // server.
                    label: t('rail.items.discussions'),
                    href: '/discussions',
                    icon: MessagesSquare,
                },
                {
                    label: t('rail.items.users'),
                    href: '/community/browse',
                    icon: Users,
                },
                {
                    // Under Community rather than under any one content type:
                    // the page ranks members AND every kind of content at once,
                    // and the half a reader comes for is usually the people.
                    label: t('rail.items.leaderboard'),
                    href: '/leaderboard',
                    icon: Trophy,
                },
                {
                    label: t('rail.items.media'),
                    href: '/media/browse',
                    icon: Images,
                },
                {
                    label: t('rail.items.messages'),
                    href: '/messages',
                    icon: MessageSquare,
                    requiresAuth: true,
                },
                {
                    label: t('rail.items.myFriends'),
                    href: '/account/friends',
                    icon: UserCheck,
                    requiresAuth: true,
                },
            ],
        },
        {
            /*
             * External sources sit at the bottom on their own rather than under
             * Assets and Mods: one `ContentSource` table serves both kinds, so a
             * leaf under each would point at the same page twice.
             */
            label: t('rail.sections.sources'),
            icon: Puzzle,
            items: [
                {
                    label: t('rail.items.browse'),
                    href: '/sources',
                    icon: Search,
                },
            ],
        },
        {
            /*
             * The docs, in the rail — city and website-processing added the
             * same one-leaf section, for the same reason: the header menu and
             * the footer column both carry this leaf, and the rail was the one
             * surface the documentation could not be reached from. Here that
             * leaf points at this very site.
             */
            label: t('rail.sections.resources'),
            icon: FolderKey,
            items: [{ label: t('rail.items.docs'), href: DOCS, icon: BookOpen }],
        },
    ]
}
