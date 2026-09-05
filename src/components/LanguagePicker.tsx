import { useEffect, useRef, useState } from 'react'
import { Languages, Check } from 'lucide-react'
import {
    LOCALES,
    LOCALE_INFO,
    LOCALE_COOKIE,
    localizeUrl,
    isLocale,
    type LocaleT,
} from '../i18n/config'
import { getT } from '../i18n/t'

/**
 * Language picker matching website-city's UX: a two-letter trigger, a dropdown
 * of endonyms with a check on the active one, no flags. Selecting a language
 * sets the shared `tmc_locale` cookie (so the choice carries to the app) and
 * navigates to the localized version of the current path.
 */
export default function LanguagePicker({
    locale = 'en',
    pathName = '/',
}: {
    locale?: string
    pathName?: string
}) {
    const current: LocaleT = isLocale(locale) ? locale : 'en'
    const t = getT(current)
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [])

    function choose(next: LocaleT) {
        try {
            document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${
                60 * 60 * 24 * 365
            }; samesite=lax`
        } catch {
            /* ignore */
        }
        window.location.href = localizeUrl(pathName, next)
    }

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t('picker.current', {
                    name: LOCALE_INFO[current].name,
                })}
                title={t('picker.select')}
                className="flex items-center gap-1.5 rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-accent"
            >
                <Languages className="h-4 w-4" />
                <span className="text-xs font-semibold">
                    {LOCALE_INFO[current].short}
                </span>
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-label={t('picker.select')}
                    className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl"
                >
                    {LOCALES.map((l) => {
                        const active = l === current
                        return (
                            <li key={l}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={active}
                                    onClick={() => choose(l)}
                                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                        active
                                            ? 'bg-accent/10 font-medium text-foreground'
                                            : 'text-muted hover:bg-surface-hover hover:text-foreground'
                                    }`}
                                >
                                    <span>{LOCALE_INFO[l].name}</span>
                                    {active && (
                                        <Check className="h-3.5 w-3.5 text-accent" />
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
