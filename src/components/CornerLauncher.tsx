import { CornerLauncher as SharedCornerLauncher } from '@modcommunity/shared'
import { isLocale, localizeUrl, DEFAULT_LOCALE } from '../i18n/config'
import { getT } from '../i18n/t'
import { mainUrl } from '../lib/site'
import { useSignedIn } from '../lib/auth-hint'

/**
 * The corner launcher: a thin wrapper over `@modcommunity/shared`'s
 * `CornerLauncher` (the compact coat: small Play pill, round more button, menu
 * sliding up from the corner). This file only resolves what is the site's own:
 * the locale, the auth hint, the destinations (through `mainUrl`, as every
 * non-docs href here, so a docs-subdomain deploy points at website-city) and the
 * labels. The styles come from `@modcommunity/shared/corner-launcher.css`.
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
