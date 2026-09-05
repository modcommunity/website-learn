// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import react from '@astrojs/react'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
    // Astro's HTML compressor collapses a newline between text and an inline
    // element into nothing rather than a single space, so wrapped markup
    // renders words jammed together. Gzip makes the size difference negligible.
    compressHTML: false,

    /*
     * The canonical origin, used for the sitemap and for absolute URLs in the
     * build. A constant rather than `process.env.PUBLIC_URL`: the config file
     * is type-checked by `astro check` without Node's globals in scope, and
     * every per-deploy URL the pages actually render (canonical, hreflang,
     * Open Graph) already reads `PUBLIC_URL` at runtime in `Layout.astro`.
     */
    site: 'https://moddingcommunity.com',

    /*
     * NO `base: '/learn'`.
     *
     * The docs mount at `/learn` on the main domain, but `base` is a single
     * static prefix and would put the locale INSIDE it — `/learn/es/api` —
     * while website-city and website-processing both serve `/es/...`. A reader
     * who switches language in the shared header has to land on the same shape
     * of URL on all three builds or the picker sends them to a 404.
     *
     * So `/learn` is a real route directory instead (`src/pages/learn/**` for
     * English, `src/pages/[lang]/learn/**` for the other eight), which gives
     * `/learn/api/content` and `/es/learn/api/content`. nginx routes both
     * `^/learn` and `^/(es|fr|de|ru|nl|ja|zh|pt)/learn` here.
     */

    // Mirrors website-city's next-intl setup and website-processing's config:
    // same 9 locales, English default, "as-needed" prefixing.
    i18n: {
        locales: ['en', 'es', 'fr', 'de', 'ru', 'nl', 'ja', 'zh', 'pt'],
        defaultLocale: 'en',
        routing: {
            prefixDefaultLocale: false,
        },
    },

    markdown: {
        /*
         * Two Shiki themes, not one. The shared <ThemeToggle/> is in this
         * site's header (unlike website-processing, which is dark-only), so a
         * single dark code theme would render black-on-black in light mode.
         * `defaultColor: false` makes Shiki emit BOTH palettes as CSS variables
         * on each token; `src/styles/components/Docs.css` picks which set
         * applies off the same `.dark` class the toggle writes.
         */
        shikiConfig: {
            themes: {
                light: 'github-light',
                dark: 'github-dark-default',
            },
            defaultColor: false,
            wrap: false,
        },
    },

    vite: {
        plugins: [tailwindcss()],
        server: {
            // Accept the proxied Host header from nginx (dev is reached via tmcdev.net).
            allowedHosts: ['x-tmc-dev01', 'tmcdev.net'],
        },
        optimizeDeps: {
            // In local mode @modcommunity/shared is a symlink into ../tmc-global.
            // Pre-bundling it caches a copy, so `npm run shared:build` looks like
            // it did nothing — and clearing that cache under a running dev server
            // leaves it serving "504 (Outdated Optimize Dep)" for every client
            // module, silently killing hydration and webfonts. Excluding it makes
            // Vite serve the linked source directly.
            exclude: ['@modcommunity/shared'],
        },
    },

    integrations: [react(), mdx()],
})
