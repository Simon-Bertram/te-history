# Search on the public site

Collection and search pages are **URL-first** (`GET /search?q=`, `GET /images?township=&location=&subject=&decade=&sort=&page=`). They do not use TanStack Query or SWR.

## Today

- Header search posts to `/search`.
- GROQ `match` groups hits as Images, Documents, Quarterly, Research, People, and Places.
- Archive ID-shaped queries are sorted to the top of Images.
- People hits exclude name-index stubs with no public incoming links.
- Facets on `/images` and `/documents` run GROQ on the server (Cloudflare on-demand rendering): township (Tredyffrin/Easttown first), place (images), subject (fuzzy tags last), decade, and image sort.

## Pagefind

[Pagefind](https://pagefind.app/) is the planned full-text engine once article, image, and document **detail pages are statically generated**. It indexes HTML at build time. Do not add it while those routes are SSR-only — the index would be empty.

When detail pages are prerendered, add `pagefind` as a `postbuild` step over `dist/` and mount its UI on `/search` alongside (or instead of) GROQ for body text.

Do not add TanStack Query, SWR, or a React search island unless header typeahead starts issuing many overlapping client requests.
