---
name: catalog-search
description: GROQ catalog, URL-first search, and facet conventions for te-history. Use when changing src/lib queries, collection pages, search, pagination, or Sanity document fetching for images, documents, people, places, research, or quarterly.
paths:
  - "src/lib/**"
  - "src/pages/search.astro"
  - "src/pages/images/**"
  - "src/pages/documents/**"
  - "src/pages/people/**"
  - "src/pages/places/**"
  - "src/pages/research/**"
  - "src/pages/subjects/**"
  - "src/pages/quarterly/**"
  - "src/components/FacetForm.astro"
  - "src/components/Search.astro"
  - "src/components/Pagination.astro"
  - "src/components/ImageGrid.astro"
  - "docs/SEARCH.md"
---

# Catalog and search

Read [docs/SEARCH.md](../../../docs/SEARCH.md) before changing search or facets. Put GROQ in `src/lib/` by catalog type (`catalog.ts`, `documents.ts`, `people.ts`, `places.ts`, `quarterly.ts`, `research.ts`, `subjects.ts`, `search.ts`, `siteNavigation.ts`). Pages import helpers; do not embed large queries in `.astro` files. Do not add a repository layer.

Fetch with `sanityClient` from `sanity:client`. Catalog routes keep `export const prerender = false`.

## URL-first

Filters are GET query params, not client cache libraries.

- Search: `GET /search?q=` (header form posts here)
- Images: `GET /images?q=&township=&location=&subject=&decade=&photographer=&sort=&page=&all=`
- Documents: same facet pattern on `/documents` (no photographer)

Do not add TanStack Query, SWR, or a React search island unless header typeahead starts issuing many overlapping client requests.

Do not add Pagefind until article, image, and document **detail** pages are statically generated. SSR-only routes produce an empty Pagefind index.

## GROQ patterns

Reuse existing helpers and `src/lib/limits.ts` constants (`IMAGES_PAGE_SIZE`, `DOCUMENTS_PAGE_SIZE`, `SEARCH_RESULT_LIMIT`, `ENTITY_IMAGE_STRIP`, `HOME_IMAGE_LIMIT`). Catalog hrefs: `hrefFor` in `href.ts`. Image and document facets: `buildFacetQuery` in `facets.ts`.

| Type | Typical filters |
| --- | --- |
| `historicalImage` | `defined(imageFile.asset)`; facets via township/location/subject refs, `dateTaken.year`, and string `photographer` (`unattributed` sentinel for empty) |
| `primarySource` | documents by `archiveId` |
| `quarterlyIssue` / `quarterlyArticle` | issue order `volume desc, issueNumber desc` |
| `researchArticle` | `defined(slug.current)` |
| `person` | public incoming links via `HAS_PUBLIC_INCOMING` (exclude name-index stubs) |
| `location` / `township` | places; townships ordered with Tredyffrin then Easttown first |
| `category` | subjects; demote fuzzy tags (`person`, `people`, `place`, `view`, `cultural`) |

- Wildcard search: `title match $q` with `$q = '*${term}*'`
- Archive-ID-shaped queries (`search.ts` `ARCHIVE_ID_PATTERN`): sort exact archive hits to the top of Images
- Image sort: `parseImageSort` → `date-desc` (default), `date-asc`, `title`
- Facet option order: `sortTownshipsFirst`, `sortSubjectsDemoteFuzzy`
- Images without user filters: featured (`featuredOnSite` / `featuredRank`) then fallback via `mergeFeaturedWithFallback`

## Routes

| Path | Helper |
| --- | --- |
| `/images`, `/images/[archiveId]` | `catalog.ts` |
| `/documents`, `/documents/[archiveId]` | `documents.ts` |
| `/search` | `searchCatalog` |
| `/people`, `/places`, `/research`, `/subjects`, `/quarterly` | `people.ts`, `places.ts`, `research.ts`, `subjects.ts`, `quarterly.ts` |

Images: `urlFor` from `src/lib/imageUrl.ts`. Portable Text: `astro-portabletext` on research and document detail pages (`portable-text-serialization` skill for custom components).
