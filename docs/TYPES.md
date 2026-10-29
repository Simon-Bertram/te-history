# Catalog data shapes and TypeGen

GROQ projections are the public site’s data contract. Pages must not re-declare `{ _id: string; title: string }` for catalog records. Import result types from `src/lib/` (or from `sanity.types.ts` only inside lib).

A Sanity document type (`person`, `historicalImage`) is not what a page receives. Queries reshape data: `township->name` is a string, `slug.current` is `slug`, `count(...)` is a number.

## TypeGen

`bun run typegen` (`sanity typegen generate`) reads:

1. [`schema.json`](../schema.json) — static extract of Studio types used by this frontend (there is no local Studio, so this file is committed instead of running `sanity schema extract`).
2. Named `defineQuery(...)` variables under `src/lib/` (see [`sanity.cli.ts`](../sanity.cli.ts)).

It writes [`sanity.types.ts`](../sanity.types.ts). Do not edit that file. Change the query or schema, then regenerate.

```text
schema.json + defineQuery in src/lib  →  bun run typegen  →  sanity.types.ts
```

### What TypeGen can see

A query must be assigned to a unique variable with `defineQuery` from `groq`:

```ts
export const TOWNSHIPS_QUERY = defineQuery(/* groq */ `
	*[_type == "township"] | order(name asc){_id, name}
`)
```

Inline `sanityClient.fetch(\`*[_type == ...]\`)` is invisible. Generated names are `{VARIABLE}_RESULT` (for example `TOWNSHIPS_QUERY_RESULT`).

Interpolating a **static** GROQ fragment into `defineQuery` is fine. Shared fragments live in [`src/lib/groq.ts`](../src/lib/groq.ts) (`IMAGE_PROJECTION`, `HAS_PUBLIC_INCOMING`, `DOCUMENT_LIST_PROJECTION`, `ENTITY_SLUG`, `PORTABLE_TEXT_WITH_EMBEDS`).

People, place, and subject URLs use `"slug": coalesce(slug.current, _id)`. Hub lookups match `_id` or `slug.current` so Archive `_id` links keep resolving after a Studio slug is added.

List pages that only need “this person appears in the catalog” use `HAS_PUBLIC_INCOMING` (`defined(*[...][0]._id)`), not `count(...)`. Hub pages still `count` photographs when the UI shows “See all N”.

### Facet builders TypeGen cannot type

`/images` and `/documents` (and township-filtered research) build the GROQ filter at runtime. Those strings stay a small builder, marked `@sanity-typegen-ignore`. Keep the **projection** identical to a static `defineQuery` in the same file, and annotate the function with that result type (`CatalogImage[]`, `DocumentsPage`).

## Lib aliases

Pages import readable names from lib, not raw `*_QUERY_RESULT` types.

| Alias | Source |
| --- | --- |
| `CatalogImage` | `FALLBACK_IMAGES_QUERY_RESULT[number]` in [`imageHighlights.ts`](../src/lib/imageHighlights.ts) |
| `TownshipOption`, `LocationOption`, `SubjectOption` | [`catalog.ts`](../src/lib/catalog.ts) |
| `LinkedPerson`, `PersonHub` | [`people.ts`](../src/lib/people.ts) |
| `PlacesIndex`, `PlaceHub` | [`places.ts`](../src/lib/places.ts) |
| `SubjectHubListItem`, `SubjectHub` | [`subjects.ts`](../src/lib/subjects.ts) |
| `OrganizationsPage`, `OrganizationListItem`, `OrganizationHub` | [`organizations.ts`](../src/lib/organizations.ts) |
| `DocumentsPage`, `DocumentDetail` | [`documents.ts`](../src/lib/documents.ts) |
| `ImageDetail` | [`catalog.ts`](../src/lib/catalog.ts) |
| `LatestQuarterlyIssue`, `QuarterlyIssueListItem`, `QuarterlyArticleDetail` | [`quarterly.ts`](../src/lib/quarterly.ts) |
| `FeaturedResearchArticle`, `ResearchListItem`, `ResearchArticleDetail` | [`research.ts`](../src/lib/research.ts) |

Useful TypeScript:

- `Foo[number]` — one element of an array result
- `NonNullable<Foo>` — drop `null` from `[0]` detail queries
- `Pick<CatalogImage, 'title' | 'imageFile'>` — a smaller view (`CatalogImageCard` for grids)

When you add a field to a projection, regenerate types. The alias and the page follow. Do not add another catalog `interface` in a `.astro` file unless it is UI-only (layout title, form props).

## `null` vs `undefined`

GROQ optional fields are `string | null`, not `string?`. Helpers that sort or compare names must accept `string | null`. Layout props that want `string | undefined` need `value ?? undefined`.

## Images

[`urlFor`](../src/lib/imageUrl.ts) accepts both `SanityImageSource` (`@sanity/image-url`) and GROQ image objects (`imageFile`, `articleImage`). Do not cast `as Parameters<typeof urlFor>[0]` at call sites.

## Navigation types

`NavLink` and `SiteNavigation` live in [`src/lib/nav.ts`](../src/lib/nav.ts) so [`siteNavigation.ts`](../src/lib/siteNavigation.ts) and [`navFallback.ts`](../src/lib/navFallback.ts) do not import each other. Components import `NavLink` from `nav.ts`.

## Workflow

1. Add or change fields in the GROQ projection in `src/lib`.
2. Run `bun run typegen`.
3. Use the field on the page. If TypeScript complains, the query and the page disagree.
4. `bun run check` (`astro check`) after TypeGen so pages and lib stay aligned.

Commit `schema.json` and `sanity.types.ts` so CI and clones type-check without a Studio extract.
