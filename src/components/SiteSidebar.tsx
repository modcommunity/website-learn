import { useMemo } from 'react'
import {
    AppSwitcher,
    AppSwitcherPanel,
    Sidebar,
    useSwitcherApps,
    type SwitcherApp,
} from '@modcommunity/shared'
import { Sparkles } from 'lucide-react'
import { getT } from '../i18n/t'
import { learnChrome } from '../i18n/chrome'
import { localeLink } from '../i18n/link'
import { MAIN_URL, mainUrl } from '../lib/site'
import {
    stripLocale,
    localizeUrl,
    isLocale,
    type LocaleT,
} from '../i18n/config'
import { useSignedIn } from '../lib/auth-hint'

/** Content type key -> city's URL segment (city: `AppContentTypeSlugs`). */
const CONTENT_SLUGS: Record<string, string> = {
    mod: 'mods',
    server: 'servers',
    asset: 'assets',
    article: 'articles',
    community: 'communities',
    collection: 'collections',
    group: 'groups',
}
const CONTENT_TYPES = Object.keys(CONTENT_SLUGS)

/**
 * The docs site's primary sidebar — the shared website-city <Sidebar> over
 * the shared chrome (`learnChrome`). Wrapped in a local component so Astro
 * only serializes the plain `pathName` / `locale` strings across the island
 * boundary.
 *
 * Three things it does beyond rendering the rail:
 *
 * - **Drops the signed-in-only leaves** (My Mods, Messages, My Friends, …) for
 *   signed-out visitors, matching city. First paint renders the signed-out set
 *   deterministically and reconciles after mount, so there is no hydration
 *   mismatch.
 * - **Renders the "Share your work" call-to-action** at the bottom. In city it
 *   opens the new-item wizard pop-up; a static build has no modal to open, so it
 *   links to `/share`, which is that same wizard as a real page.
 * - **Starts every section folded.** City unfolds the section holding the page
 *   you are on, which is the point of the rail there. Here the rail's
 *   destinations all live on city — none of this site's own routes is inside a
 *   section — so an unfolded section would only ever be an accident of a shared
 *   path prefix, not a place the reader actually is.
 */
export default function SiteSidebar({
    pathName = '/',
    locale = 'en',
}: {
    pathName?: string
    locale?: string
}) {
    const t = getT(locale)
    const lang: LocaleT = isLocale(locale) ? locale : 'en'

    const signedIn = useSignedIn()
    const sections = learnChrome(locale, signedIn).sidebar

    // A website-city route, like everything in the rail that is not a doc —
    // so it needs the main origin, and this anchor is hand-rolled rather than
    // routed through `localeLink`.
    const shareHref = mainUrl(localizeUrl('/share', lang))
    const shareTitle = t('rail.share.title')

    // The app list comes from city (the main origin) in the browser. If city is
    // down the fetch rejects inside the hook, the list stays empty, and the
    // panel shows its "none" state; the rest of the page is unaffected.
    const { apps, loading } = useSwitcherApps(MAIN_URL, locale)
    const switcher = useMemo(
        () => ({
            apps,
            loading,
            // Learn has no per-app routes, so there is never a current app.
            currentApp: null,
            labels: {
                find: t('appSwitcher.find'),
                open: t('appSwitcher.open'),
                hint: t('appSwitcher.hint'),
                search: t('appSwitcher.search'),
                none: t('appSwitcher.none'),
                visit: t('appSwitcher.visit'),
                loading: t('appSwitcher.loading'),
                contentTypes: Object.fromEntries(
                    CONTENT_TYPES.map((k) => [
                        k,
                        t(`appSwitcher.contentTypes.${k}`),
                    ])
                ),
            },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [apps, loading, locale]
    )

    // City's routes: `/{app}` and `/{app}/{plural}`, with a locale prefix for
    // every locale but English (`localePrefix: 'as-needed'`).
    const hrefFor = (app: SwitcherApp, contentType?: string) => {
        const seg = encodeURIComponent(app.url)
        const slug = contentType ? CONTENT_SLUGS[contentType] : undefined
        return mainUrl(localizeUrl(slug ? `/${seg}/${slug}` : `/${seg}`, lang))
    }

    return (
        <>
            <Sidebar
                activePath={stripLocale(pathName)}
                sections={sections}
                expandActiveSection={false}
                linkComponent={localeLink(locale)}
                /* Resting state is the icon rail: pointing at it opens the full
               panel OVER the page, and the toggle pins that open. City made the
               same move — the rail was spending 16rem of every page on a nav
               nobody reads twice — and the two shells share one persisted flag,
               so a reader who pinned it open in the app arrives here pinned. */
                defaultCollapsed
                hoverExpand
                /* Plus Jakarta Sans for the rail alone, as in city: the nav is a
               fixed set of short labels read at a glance rather than prose, and
               its wider shapes hold up at 13px where the body face goes muddy. */
                className="font-pjs"
                labels={{
                    expand: t('sidebar.expand'),
                    collapse: t('sidebar.collapse'),
                    pin: t('sidebar.pin'),
                    unpin: t('sidebar.unpin'),
                }}
                footer={
                    <div className="flex flex-col gap-2">
                        <AppSwitcher expanded {...switcher} />
                        <a
                            href={shareHref}
                            className="group relative block w-full overflow-hidden rounded-xl border border-accent/30 bg-gradient-to-br from-accent/15 to-[#5577f0]/5 p-4 text-left transition-visual duration-300 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20"
                        >
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Sparkles className="h-4 w-4 text-accent" />
                                {shareTitle}
                            </div>
                            <p className="mt-1 text-xs text-muted">
                                {t('rail.share.desc')}
                            </p>
                            <span className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-accent/20 blur-2xl transition-visual duration-500 group-hover:scale-150" />
                        </a>
                    </div>
                }
                footerCollapsed={
                    <div className="flex flex-col gap-2">
                        <AppSwitcher expanded={false} {...switcher} />
                        <a
                            href={shareHref}
                            title={shareTitle}
                            aria-label={shareTitle}
                            className="group relative flex w-full items-center justify-center rounded-xl border border-accent/30 bg-gradient-to-br from-accent/15 to-[#5577f0]/5 p-3 text-accent transition-visual duration-300 hover:border-accent/60"
                        >
                            <Sparkles className="h-4 w-4" />
                        </a>
                    </div>
                }
            />
            <AppSwitcherPanel {...switcher} hrefFor={hrefFor} />
        </>
    )
}
