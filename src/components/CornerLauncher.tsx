import { CornerLauncher as SharedCornerLauncher } from '@modcommunity/shared'
import { isLocale, localizeUrl, DEFAULT_LOCALE } from '../i18n/config'
import { getT } from '../i18n/t'
import { mainUrl } from '../lib/site'
import { useSignedIn } from '../lib/auth-hint'

/**
 * The corner launcher (Play / Console / Chat). The block itself — both coats,
 * the phone stack, the sheen — lives in `@modcommunity/shared`
 * (`CornerLauncher`), shared with website-city, website-processing and
 * website-status; its styles come from `@modcommunity/shared/corner-launcher.css`
 * (imported in `styles/Components.css`). What stays here is what only this site
 * knows: the strings, the locale, the signed-in cookie hint and the addresses.
 *
 * Every destination belongs to website-city, not to this build — so they go
 * through `mainUrl` as well as `localizeUrl`, exactly as every non-docs href in
 * the shell does (see `i18n/link.tsx`). On a `/learn`-on-the-main-domain deploy
 * `MAIN_URL` is empty and these stay relative; on a docs-subdomain deploy they
 * become absolute, or a `/play` here would resolve against the docs host and 404.
 *
 * Hydrated (`client:idle` in `Layout.astro`): the signed-in coat is read from
 * the cookie after mount, so first paint is the signed-out state on both server
 * and client. On a docs-subdomain deploy that cookie only arrives if
 * website-city's `AUTH_COOKIE_DOMAIN` is the shared parent — otherwise every
 * reader here reads as signed out and the squares point at `/login`, which is
 * wrong but harmless.
 */
export default function CornerLauncher({ locale = 'en' }: { locale?: string }) {
    const t = getT(locale)
    const loc = isLocale(locale) ? locale : DEFAULT_LOCALE
    const signedIn = useSignedIn()

    const login = mainUrl(localizeUrl('/login', loc))

    return (
        <SharedCornerLauncher
            play={mainUrl(localizeUrl('/play', loc))}
            chat={signedIn ? mainUrl(localizeUrl('/messages', loc)) : login}
            console={signedIn ? mainUrl(localizeUrl('/console', loc)) : login}
            signedIn={signedIn}
            umamiEvent="docs_launcher"
            labels={{
                play: t('dock.play'),
                playAria: t('dock.playAria'),
                console: t('dock.console'),
                chat: t('dock.chat'),
                chatLabel: t('dock.chatLabel'),
                signIn: t('dock.signIn'),
                open: t('dock.open'),
                close: t('dock.close'),
            }}
        />
    )
}
