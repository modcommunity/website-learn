import { useEffect, useState } from 'react'
import { BookOpen, Home } from 'lucide-react'
import DocsSearch from './DocsSearch'
import { DEFAULT_LOCALE, isLocale, localizeUrl, type LocaleT } from '../../i18n/config'
import { getT } from '../../i18n/t'
import { DOCS_ROOT } from '../../docs/mount'

/**
 * The body of the documentation's 404 page.
 *
 * An island, and it has to be: a static build emits ONE 404 document, and the
 * host serves it for every unmatched path in every language. The locale is
 * therefore only knowable at request time, from the URL the visitor actually
 * asked for — so the whole (tiny) catalogue ships and the right one is picked
 * after mount.
 *
 * First paint is the default locale, deterministically, so there is no
 * hydration mismatch — the same trick `AccountButton` uses for the auth hint.
 */
export default function NotFoundBody() {
    const [locale, setLocale] = useState<LocaleT>(DEFAULT_LOCALE)

    useEffect(() => {
        const seg = window.location.pathname.split('/')[1]
        if (isLocale(seg)) setLocale(seg)
    }, [])

    const t = getT(locale)

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-24 text-center">
            <span className="rounded-2xl border border-border bg-surface-secondary p-4 text-accent">
                <BookOpen className="h-8 w-8" />
            </span>

            <h1 className="font-pjs text-3xl font-bold text-foreground @2xl:text-4xl">
                {t('notFound.heading')}
            </h1>

            <p
                className="text-lg text-muted [&_.special]:text-accent"
                dangerouslySetInnerHTML={{ __html: t('notFound.body') }}
            />

            {/* The most useful thing on a 404 in a documentation site is the
                search box — the reader knows what they wanted, they just do not
                know where it moved to. */}
            <div className="w-full max-w-md">
                <DocsSearch locale={locale} />
            </div>

            <a
                href={localizeUrl(DOCS_ROOT, locale)}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2 font-pjs text-sm font-medium text-foreground transition-colors hover:border-accent/50"
            >
                <Home className="h-4 w-4" />
                {t('docs.nav.label')}
            </a>
        </div>
    )
}
