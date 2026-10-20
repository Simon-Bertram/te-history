# Search on the public site

Collection and search pages are **URL-first** (`GET /search?q=`, `GET /images?township=&location=&subject=&decade=&photographer=&sort=&page=`). They do not use TanStack Query or SWR.

## Today

- Header search posts to `/search`.
- GROQ `match` groups hits as Images, Documents, Quarterly, Research, People, and Places.
- Archive ID-shaped queries are sorted to the top of Images.
- People hits exclude name-index stubs with no public incoming links (`HAS_PUBLIC_INCOMING` existence check, not a full reverse-link count).
- Facets on `/images` and `/documents` run GROQ on the server (`prerender = false`): township (Tredyffrin/Easttown first), place (images), subject (fuzzy tags last), decade, photographer (images; case-insensitive string match, `photographer=unattributed` for missing/empty), and image sort. Identical facet URLs may be absorbed at the edge (`s-maxage` / `stale-while-revalidate`).
- Photographer remains a free-text string on `historicalImage`. A later Studio migration may replace it with a `photographer` document reference; until then the public facet normalizes casing in the dropdown only.
- Image, document, research, people, place, and subject **detail** HTML is prerendered at build.
- People `/people/:slug`, places `/places/:slug`, and subjects `/subjects/:slug` prefer `slug.current` and fall back to `_id`. Images and documents stay on `archiveId`.

## Pagefind

[Pagefind](https://pagefind.app/) can index prerendered detail HTML in `dist/`. Do not add it yet — keep URL-first GROQ search for Archive IDs and grouped types. When added, mount it on `/search` alongside GROQ for body text.

Do not add TanStack Query, SWR, or a React search island unless header typeahead starts issuing many overlapping client requests.
