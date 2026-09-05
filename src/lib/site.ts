/**
 * The site's public origin. `Layout.astro` reads the same `PUBLIC_URL` for its
 * canonical/hreflang/Open Graph URLs; `robots.txt` and `sitemap.xml` import it
 * from here so all four agree on one origin per deploy.
 */
export const SITE_URL: string = import.meta.env.PUBLIC_URL ?? 'https://moddingcommunity.com'
