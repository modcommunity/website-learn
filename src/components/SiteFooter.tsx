import { Footer } from '@modcommunity/shared'
import { getT } from '../i18n/t'
import { buildFooterColumns } from '../i18n/nav'
import { localeLink } from '../i18n/link'

/** The landing site's footer — the shared website-city <Footer>, translated. */
export default function SiteFooter({ locale = 'en' }: { locale?: string }) {
    const t = getT(locale)
    // UTC, matching website-city's footer. `getFullYear()` reads the runtime's
    // local zone — the build machine's when the page is generated, the viewer's
    // when this island hydrates — and around New Year those disagree, so the
    // copyright text node changes under the reader for no reason.
    const year = new Date().getUTCFullYear()

    return (
        <Footer
            year={year}
            slogan={t('footer.slogan')}
            columns={buildFooterColumns(t)}
            linkComponent={localeLink(locale)}
            copyright={t('footer.copyright', { year })}
        />
    )
}
