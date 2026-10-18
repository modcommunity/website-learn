import { Footer } from '@modcommunity/shared'
// The mark as a file, not the data URI; see SiteHeader.
import lockup from '@modcommunity/shared/logo01.webp'
import { learnChrome } from '../i18n/chrome'
import { localeLink } from '../i18n/link'

/** The docs site's footer: the shared website-city <Footer> over the shared chrome. */
export default function SiteFooter({ locale = 'en' }: { locale?: string }) {
    // The copyright year is UTC inside `buildChrome`, matching website-city's
    // footer: a local-zone year differs between the build machine and the
    // viewer around New Year, and the text node would change on hydration.
    const { footer, socials, slogan, copyright } = learnChrome(locale)
    const Link = localeLink(locale)

    return (
        <Footer
            slogan={slogan}
            columns={footer}
            socials={socials}
            linkComponent={Link}
            logoSrc={lockup}
            copyright={copyright}
        />
    )
}
