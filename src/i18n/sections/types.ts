import type { LocaleT } from '../config'

/**
 * A landing-section's translated strings, keyed by locale. `en` must be
 * complete; other locales may omit keys (they fall back to English per-key via
 * getT). Values may be plain text OR HTML fragments — the latter are rendered
 * with `set:html` at the call site, so a translation keeps the inline
 * `<span class="special">…</span>` / `<a …>` markup around the translated words.
 */
export type SectionCatalog = Record<LocaleT, Record<string, string>>
