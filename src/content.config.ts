import { defineCollection } from 'astro:content'
// `astro:content` re-exports `z`, but that re-export is deprecated as of Astro
// 7 and warns on every schema field. `astro/zod` is the same zod instance
// without the deprecation.
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

/**
 * The documentation corpus.
 *
 * One flat collection whose ids carry the locale as their first segment:
 *
 *     src/content/docs/en/api/content/authentication.mdx  ->  en/api/content/authentication
 *     src/content/docs/es/api/content/authentication.mdx  ->  es/api/content/authentication
 *
 * A single collection rather than one per language because every consumer —
 * the nav tree, the pager, the search index, the fallback lookup — needs to ask
 * "is there an `es` copy of this page?", and that is one `getEntry` against a
 * predictable id instead of nine collections to switch on.
 *
 * **English is the reference tree.** `src/docs/tree.ts` builds the navigation
 * from the `en` entries alone and then swaps in a translated title wherever a
 * locale has the file, so a half-translated language still shows the complete
 * table of contents — the same per-key fallback the shell strings get from
 * `src/i18n/t.ts`, applied at page granularity.
 */
const docs = defineCollection({
    loader: glob({
        base: './src/content/docs',
        pattern: '**/*.{md,mdx}',
    }),
    schema: z.object({
        /** H1 and nav label. Required — a page with no title cannot be linked. */
        title: z.string(),
        /**
         * One-line summary. Used as the page's `<meta name="description">`, the
         * card blurb on section index pages, and the snippet in search results,
         * so write it as prose that stands alone rather than a fragment.
         */
        description: z.string(),
        /**
         * Sort key within the containing folder. Ties break alphabetically by
         * slug, so a folder can leave this off entirely and still be stable.
         */
        order: z.number().default(100),
        /**
         * Overrides {@link title} in the sidebar when the real title is too
         * long for a 16rem rail ("Authenticating with signed assertions" ->
         * "Signed assertions").
         */
        navTitle: z.string().optional(),
        /**
         * Marks a page as the landing page for its folder. The tree renders it
         * as the section header's own link instead of a child leaf, and the
         * pager treats it as the first page of the section.
         */
        index: z.boolean().default(false),
        /** Extra terms to match in search that do not appear in the prose. */
        keywords: z.array(z.string()).default([]),
        /**
         * Ribbon shown beside the nav label and above the title. `new` and
         * `updated` are editorial; `draft` also hides the page from search.
         */
        badge: z.enum(['new', 'updated', 'draft']).optional(),
        /**
         * Hide from the nav tree and the search index but still build the page.
         * For deep-links that only make sense when arrived at from prose.
         */
        hidden: z.boolean().default(false),
        /**
         * Source of truth this page was written against, as a repo-relative
         * path in `../website-city`. Not rendered — it is a maintenance note so
         * the next person can diff the docs against the code that moved.
         */
        source: z.array(z.string()).default([]),
    }),
})

export const collections = { docs }
