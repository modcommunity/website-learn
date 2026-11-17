# Analytics (Umami custom events)

Umami loads only when both env vars are set at build time (they are inlined into the static output):

| Env var | Meaning |
| --- | --- |
| `PUBLIC_UMAMI_SRC` | URL of the Umami `script.js` |
| `PUBLIC_UMAMI_WEBSITE_ID` | This site's own Umami website id (never reuse another site's) |

Unset means nothing is loaded and every call below is a silent no-op. Set them in the deploy `.env` (see `.env.ex`).

All events go through `src/lib/umami.ts` (`track()`), the in-page copies in `DocsEnhancements.astro` (`emit()`), or
declarative `data-umami-event` attributes. `track()` never throws, no-ops without `window` or `window.umami`, and adds
`path` and `locale` to every event. Names are `docs_<area>_<action>` (snake case, the registry's established style).
No PII: search text is never sent (only `qlen`, `qwords`, `qbucket` from `queryShape`), and nav/TOC/pager events carry
identifiers (slug, href), not translated labels.

`npm run umami:check` (also run by `npm test`) fails when a registered name has no call site, or when an
`onClick`/`onSubmit`/`<form>`/`<button>`/click listener has no event within 10 lines. A pure-UI toggle is exempted with a
comment `umami-ignore: <reason>`.

## Events

| Event | Fires | Props |
| --- | --- | --- |
| `docs_search_open` | search modal opened | |
| `docs_search_query` | settled query (500 ms debounce) | `qlen`, `qwords`, `qbucket`, `results` |
| `docs_search_select` | result opened (click or Enter) | `qlen`, `qwords`, `qbucket`, `href`, `rank`, `results`, `via` |
| `docs_search_abandon` | modal closed after a query with no pick | `qlen`, `qwords`, `qbucket`, `results` |
| `docs_search_error` | index failed to load | error info |
| `docs_nav_link` | sidebar link | `href`, `level` |
| `docs_nav_section_toggle` | sidebar section expand/collapse | `section`, `open` |
| `docs_nav_drawer` | mobile drawer opened | `open` |
| `docs_toc_click` | table-of-contents entry | `slug`, `depth`, `index` |
| `docs_heading_anchor` | heading `#` link | `slug`, `depth` |
| `docs_code_copy` / `docs_code_copy_error` | copy-code button | `lang`, `lines` |
| `docs_details_open` | `<Details>` opened | `title` |
| `docs_card_click` / `docs_related_click` | `<Card>` / `<Related>` link | `href` |
| `docs_pager` | prev/next pager | `dir`, `href` |
| `docs_app_link` | shell link to the app sites | `href` |
| `docs_launcher` | corner launcher | |
| `docs_locale_change` | language picker | `from`, `to` |
| `docs_theme_change` | light/dark switch (observer on `data-theme`) | `from`, `to` |
| `docs_account` | account control | `signedIn` |
| `docs_header_link` | shared header link | `item` |
| `docs_not_found` | 404 page shown | `missed`, `from` |
| `docs_download` | click on a file link (`download` or file extension) | `file`, `ext` |
| `outbound-link-click` | any click to another host (delegated, includes React islands) | `url` (origin and path only) |

Not present on this site, so no events: forms, sign-up/login, a feedback widget. Add the event with the control; the
guard test fails on an unmarked new handler.
