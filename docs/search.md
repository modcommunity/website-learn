# Search

There is no search server. `src/pages/learn/search/[locale].json.ts` emits one index per locale at build time, and `DocsSearch.tsx` fetches and scores it in the browser **on the first keystroke, not at page load**, so a reader who never searches pays nothing. One index per locale because a reader only searches their own language; one combined file would make every visitor download eight indexes they never query.

## The scorer is pure, and tested

The scorer lives in `src/lib/search.ts`, not in the component: `search`, `snippetFor`, `mark`, `countOf` and `toPlainText` are pure functions with no React and no DOM, covered by `src/lib/search.test.ts`. The component owns the dialog, the fetch and the keyboard handling. The endpoint imports `toPlainText` from the same file, so what goes into the index and what scores it cannot drift apart.

`mark()` matches against the **original** text and escapes the pieces afterwards. Do not simplify it to escaping first and matching the result: the escaped form contains `&amp;`, `&lt;` and `&quot;`, so a search for `&` got a half-marked entity and a search for `amp` or `lt` highlighted the inside of entities that are nowhere in the prose.

## Scoring

AND across query terms, weighted by where a term matched (title ≫ keywords ≫ heading ≫ description ≫ body; `WEIGHTS` in `search.ts`), with diminishing returns on body frequency. Code fences are stripped from the index: every API page contains `curl` and `Authorization`, so matching on them is noise. Draft pages are excluded, and so are `hidden` ones (they never enter the tree the index is built from).

## Keywords

Frontmatter `keywords` is how you catch the word a reader actually types. It sits second because it is the only signal in the index that is deliberate rather than derived: the author saying "people look for this page under *2FA*, and the page only ever says *two-factor authentication*". Put the synonym, the abbreviation, the status code, the old name; do not repeat words already in the title, which score higher anyway. The index takes the union of the translated file's keywords and English's, because identifiers (`apiPublic`, an endpoint path) do not translate and a Spanish reader still searches for them by name. Quote numeric keywords.
