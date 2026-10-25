import {
    AccountButton,
    Header,
    HeaderActions,
    HeaderLinks,
    LanguagePicker,
    MobileNav,
    ThemeToggle,
} from '@modcommunity/shared'
import { WriteLocaleCookie } from '@modcommunity/shared/i18n'
/*
 * The mark as a FILE rather than the package's inline data URI: the data URI is
 * ~14 kB of base64 in the island's JS and again in the HTML at each place the
 * shell draws the mark, on every page; the file is one cached request. Vite
 * hashes and emits it under `learn/_astro/`. Passed as `logoSrc` rather than a
 * `logo` slot, so the shell's own <Logo> keeps the bar's locale-aware link.
 */
import lockup from '@modcommunity/shared/logo01.webp'
import { getT } from '../i18n/t'
import { learnChrome } from '../i18n/chrome'
import { localeLink } from '../i18n/link'
import { isLocale, localizeUrl, stripLocale } from '../i18n/config'
import { MAIN_URL } from '../lib/site'
import { useSignedIn } from '../lib/auth-hint'
import { track } from '../lib/umami'

/**
 * The docs site's header: the shared website-city <Header> with the shared
 * chrome (`learnChrome`) and the shared header controls in `HeaderActions`.
 * Wrapped in a local component so Astro only serializes the plain `pathName` /
 * `locale` strings across the island boundary (the nav, link component and
 * translations hold functions and stay on the client).
 *
 * The `left` slot carries the shared <MobileNav/> drawer. Both halves of the
 * desktop shell appear at the same breakpoint — the header nav is `md:flex` and
 * <SiteSidebar/> is `md:flex` — and the drawer's own trigger is `md:hidden`, so
 * exactly one of the two navigations exists at any width and a phone is never
 * left without one. It is given the same nav + rail sections those two render,
 * so the drawer is the whole shell in one panel.
 *
 * Below `sm` the bar has no room for the language picker, the theme toggle or
 * the account button ("My Account" wraps under ~375px): `HeaderActions` hides
 * the first two there and the account is `sm`-and-up, so all three move into
 * the drawer's footer, as in city's drawer. Exactly one copy of each is
 * visible at any width.
 */
export default function SiteHeader({
    pathName = '/',
    locale = 'en',
}: {
    pathName?: string
    locale?: string
}) {
    const t = getT(locale)

    // Signed-out on the server and the first paint, reconciled after mount,
    // so the island hydrates without a mismatch.
    const signedIn = useSignedIn()
    const { nav, sidebar } = learnChrome(locale, signedIn)
    const Link = localeLink(locale)

    const switchLocale = (next: string, from: string) => {
        if (!isLocale(next)) return
        /*
         * Before the navigation, not after: the assignment below unloads the
         * page, and an event queued on the way out may never be sent. `from`
         * as well as `to`, because the interesting number is which languages
         * people SWITCH AWAY FROM, which is where a translation is failing.
         */
        track('docs_locale_change', { from, to: next })
        // On a docs subdomain the cookie goes on the main domain, so the
        // choice reaches city and website-processing (see docs/deployment.md).
        WriteLocaleCookie(next, { mainUrl: MAIN_URL || undefined })
        window.location.href = localizeUrl(pathName, next)
    }

    const language = (
        <LanguagePicker
            locale={locale}
            onSelect={switchLocale}
            labels={{ current: t('picker.current'), select: t('picker.select') }}
        />
    )
    const theme = (
        <ThemeToggle cookieOptions={{ mainUrl: MAIN_URL || undefined }} labels={{ toLight: t('theme.toLight'), toDark: t('theme.toDark') }} />
    )
    const links = (showLabels?: boolean) => (
        <HeaderLinks
            signedIn={signedIn}
            cityUrl={MAIN_URL}
            locale={locale}
            labels={{ app: t('account.app'), dashboard: t('account.dashboard') }}
            onNavigate={(item) => track('docs_header_link', { item })}
            showLabels={showLabels}
        />
    )
    const account = (className: string) => (
        <AccountButton
            signedIn={signedIn}
            cityUrl={MAIN_URL}
            locale={locale}
            labels={{ signIn: t('account.signIn'), myAccount: t('account.myAccount') }}
            /*
             * `signedIn` is the whole point: this one button is Sign In for a
             * stranger and My Account for a member, and the split says how
             * much of the documentation's traffic already has an account.
             */
            onNavigate={(s) => track('docs_account', { signedIn: s })}
            className={className}
        />
    )

    return (
        <Header
            activePath={stripLocale(pathName)}
            nav={nav}
            linkComponent={Link}
            logoSrc={lockup}
            // Entries that no longer fit collapse into this dropdown as the bar
            // narrows. Without it the trigger reads "More" in all nine
            // languages; city passes its own `nav.more` for the same reason.
            moreLabel={t('nav.more')}
            left={
                <MobileNav
                    activePath={stripLocale(pathName)}
                    nav={nav}
                    sections={sidebar}
                    linkComponent={Link}
                    logoSrc={lockup}
                    footer={
                        <div className="flex flex-col gap-2 sm:hidden">
                            {links(true)}
                            <div className="flex items-center justify-between gap-2">
                                {language}
                                {theme}
                            </div>
                            {account('block')}
                        </div>
                    }
                    labels={{
                        open: t('mobile.open'),
                        close: t('mobile.close'),
                        title: t('mobile.title'),
                    }}
                />
            }
            right={
                <HeaderActions
                    language={language}
                    theme={theme}
                    links={links()}
                    account={account('hidden sm:block')}
                />
            }
        />
    )
}
