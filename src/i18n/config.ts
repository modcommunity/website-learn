/**
 * The languages the landing site speaks — mirrors website-city's
 * `src/i18n/locales.ts` so both apps offer the exact same set, default and
 * endonym display names.
 */
export const LOCALES = [
    'en',
    'es',
    'fr',
    'de',
    'ru',
    'nl',
    'ja',
    'zh',
    'pt',
] as const

export type LocaleT = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: LocaleT = 'en'

/** Every locale except the default — the ones that carry a URL prefix. */
export const NON_DEFAULT_LOCALES = LOCALES.filter(
    (l): l is Exclude<LocaleT, 'en'> => l !== DEFAULT_LOCALE
)

/**
 * Display metadata for the language picker. `short` is the two-letter trigger
 * label; `name` is the endonym (a Spanish speaker scans for "Español", not
 * "Spanish"), matching website-city.
 */
export const LOCALE_INFO: Record<LocaleT, { short: string; name: string }> = {
    en: { short: 'EN', name: 'English' },
    es: { short: 'ES', name: 'Español' },
    fr: { short: 'FR', name: 'Français' },
    de: { short: 'DE', name: 'Deutsch' },
    ru: { short: 'RU', name: 'Русский' },
    nl: { short: 'NL', name: 'Nederlands' },
    ja: { short: 'JA', name: '日本語' },
    zh: { short: 'ZH', name: '中文' },
    pt: { short: 'PT', name: 'Português' },
}

/** The cookie website-city's next-intl reads for locale detection; we set it too
 *  so a language choice on the landing site carries over to the app. */
export const LOCALE_COOKIE = 'tmc_locale'

/** Narrowing helper for untrusted input (route params, cookies). */
export function isLocale(value: unknown): value is LocaleT {
    return (
        typeof value === 'string' &&
        (LOCALES as readonly string[]).includes(value)
    )
}

/** Strip a leading locale segment, returning the path as the default locale
 *  sees it (always starting with `/`). `/es/tos` → `/tos`, `/es` → `/`. */
export function stripLocale(pathName: string): string {
    const seg = pathName.split('/')[1]
    if (isLocale(seg) && seg !== DEFAULT_LOCALE) {
        const rest = pathName.slice(seg.length + 1)
        return rest || '/'
    }
    return pathName || '/'
}

/** `localizeUrl` for `.astro` components, which hold the locale as the possibly
 *  undefined `Astro.currentLocale`. */
export function localizePath(
    pathName: string,
    locale: string | undefined
): string {
    return localizeUrl(pathName, isLocale(locale) ? locale : DEFAULT_LOCALE)
}

/** Build the URL for `pathName` under `locale`. Default locale stays unprefixed;
 *  others get a `/xx` prefix. Accepts an already-prefixed or bare path. */
export function localizeUrl(pathName: string, locale: LocaleT): string {
    const base = stripLocale(pathName)
    if (locale === DEFAULT_LOCALE) return base
    return base === '/' ? `/${locale}/` : `/${locale}${base}`
}
