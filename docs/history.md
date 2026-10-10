# History

Bugs worth remembering because they could come back. Each lesson is also a rule in [CLAUDE.md](../CLAUDE.md) or a topic doc.

## A NUL byte that hid a file from grep

A NUL byte got into `DocsSearch.tsx` and made the file test as binary, so `grep` skipped it silently and several searches came back wrongly empty. `npm run docs:check` now fails on a NUL byte anywhere in source.

## `mark()` and HTML entities

The highlighter once escaped the text first and matched against the escaped result, so a search for `&` produced a half-marked entity and searches for `amp` or `lt` lit up the inside of entities that were nowhere in the prose. It now matches the original text and escapes the pieces afterwards ([search.md](search.md#the-scorer-is-pure-and-tested)).

## A numeric keyword broke the build

`keywords: [429]` parsed as a number and failed the string schema. Quote numeric keywords.

## The trigger bar that widened the page

Before `.docs-shell > astro-island { display: contents }`, the docs nav island's wrapper became a flex item beside the article; at 390px it squeezed the article to zero and pushed the page 258px wide ([layout.md](layout.md#the-three-columns)).

## The site nav over the drawer's close button

The drawer once rendered in place inside `<main>`, a stacking context below the shared header, so the header painted over its close button whatever z-index the drawer asked for. Overlays are now portalled to `<body>`.
