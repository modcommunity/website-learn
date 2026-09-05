import { Header, MobileNav, ThemeToggle } from '@modcommunity/shared'
import AccountButton from './AccountButton'
import LanguagePicker from './LanguagePicker'
import { getT } from '../i18n/t'
import { buildNav, buildVisibleSidebarSections } from '../i18n/nav'
import { localeLink } from '../i18n/link'
import { stripLocale } from '../i18n/config'
import { useSignedIn } from '../lib/auth-hint'

/**
 * The landing site's header — the shared website-city <Header> with a translated
 * nav plus the language picker, light/dark toggle and sign-in / account action.
 * Wrapped in a local component so Astro only serializes the plain `pathName` /
 * `locale` strings across the island boundary (the nav config, link component
 * and translations stay on the client where their functions live).
 *
 * The `left` slot carries the shared <MobileNav/> drawer. Both halves of the
 * desktop shell appear at the same breakpoint — the header nav is `md:flex` and
 * <SiteSidebar/> is `md:flex` — and the drawer's own trigger is `md:hidden`, so
 * exactly one of the two navigations exists at any width and a phone is never
 * left without one. It is given the same nav + sidebar sections those two
 * render, so the drawer is the whole shell in one panel.
 *
 * The account action is `sm`-and-up only: below 640px "My Account" overflows the
 * bar (it wraps/clips under ~375px), so it moves into the drawer's footer slot
 * instead. Exactly one of the two is visible at any width.
 */
export default function SiteHeader({
    pathName = '/',
    locale = 'en',
}: {
    pathName?: string
    locale?: string
}) {
    const t = getT(locale)

    // Drops the signed-in-only leaves from the pillar dropdowns, matching what
    // <SiteSidebar/> does to the rail. First paint renders the signed-out set
    // deterministically and reconciles after mount, so there is no hydration
    // mismatch — the same trick `AccountButton` uses.
    const signedIn = useSignedIn()
    const nav = buildNav(t)

    return (
        <Header
            activePath={stripLocale(pathName)}
            nav={nav}
            linkComponent={localeLink(locale)}
            // Entries that no longer fit collapse into this dropdown as the bar
            // narrows (see the shared <HeaderNav/>). Without it the trigger
            // reads "More" in all nine languages; city passes its own `nav.more`
            // here for the same reason.
            moreLabel={t('nav.more')}
            left={
                <MobileNav
                    activePath={stripLocale(pathName)}
                    nav={nav}
                    sections={buildVisibleSidebarSections(t, signedIn)}
                    linkComponent={localeLink(locale)}
                    footer={
                        <AccountButton
                            signInLabel={t('account.signIn')}
                            myAccountLabel={t('account.myAccount')}
                            locale={locale}
                            className="block sm:hidden"
                        />
                    }
                    labels={{
                        open: t('mobile.open'),
                        close: t('mobile.close'),
                        title: t('mobile.title'),
                    }}
                />
            }
            right={
                <>
                    <LanguagePicker locale={locale} pathName={pathName} />
                    <ThemeToggle
                        labels={{
                            toLight: t('theme.toLight'),
                            toDark: t('theme.toDark'),
                        }}
                    />
                    <AccountButton
                        signInLabel={t('account.signIn')}
                        myAccountLabel={t('account.myAccount')}
                        locale={locale}
                        className="hidden sm:block"
                    />
                </>
            }
        />
    )
}
