# Fetching Sanity Studio data in Astro

How to wire a Studio field or document type into this public site. TypeGen detail lives in [TYPES.md](TYPES.md); this guide is the end-to-end checklist.

## Pipeline

```text
Studio schema
  → schema.json (committed extract; no Studio in this repo)
  → defineQuery in src/lib/*.ts
  → bun run typegen → sanity.types.ts
  → getX() helper
  → .astro page / layout / component
```

The GROQ **projection** is the public contract. If a field is not in the projection, the page will never see it — even when Studio has it.

## Prerequisites

- `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, and `PUBLIC_SANITY_API_VERSION` in `.env` (see [`.env.example`](../.env.example))
- Client import: `import {sanityClient} from 'sanity:client'`
- This repo does **not** embed Studio. Schema changes happen in the Studio project (`studio-tehs-document-db`), then `schema.json` is refreshed here

## Checklist

1. **Confirm the Studio shape**  
   Read the Studio schema (or document in Studio) for exact field names, nested objects, and `_type` values. Nested menus, portable text, and references need nested projections.

2. **Refresh `schema.json` when Studio types change**  
   From the Studio repo:

   ```bash
   bunx sanity schema extract --path=/path/to/te-history/schema.json --force
   ```

   Commit the updated `schema.json` with the frontend change. Stale extracts leave arrays typed as old members only (for example `navLink` without `navMenu`).

3. **Add or extend a named `defineQuery` in `src/lib/`**  
   Put GROQ next to related helpers (`people.ts`, `siteNavigation.ts`, …). Do not embed large queries in `.astro` files.

   ```ts
   export const EXAMPLE_QUERY = defineQuery(/* groq */ `
   	*[_type == "example"][0]{
   		title,
   		nested[]{_key, _type, label, href}
   	}
   `)
   ```

4. **Project every field the UI needs**  
   Nested objects need nested projections. Include `_type` when the array is a union (leaf vs menu, block types, etc.).

5. **Export a fetch helper**  
   Prefer `getX()` that calls `sanityClient.fetch(QUERY)`. Normalize or fall back when CDN data can be partial (see `getSiteNavigation` in [`siteNavigation.ts`](../src/lib/siteNavigation.ts)).

6. **Regenerate types and type-check**

   ```bash
   bun run typegen
   bun run check
   ```

7. **Use the helper from the page or layout**  
   Import result aliases from `src/lib/`, not raw `*_QUERY_RESULT` types in components. Pass props into `.astro` components.

## Worked example: site navigation submenu

Studio stores Header **Explore** as `_type: "navMenu"` with `children[]` of `navSubLink` (label + href, no `kind`). Leaf items remain `_type: "navLink"`.

**Before (broken):** the query only projected leaf fields and the normalizer required `href`, so menus were dropped:

```groq
primaryLinks[]{_key, label, href, kind, purpose}
```

**After:** project `_type` and `children`, then branch in the normalizer / UI:

```groq
primaryLinks[]{
  _key, _type, label, href, kind, purpose,
  children[]{_key, _type, label, href, purpose}
}
```

Frontend pieces:

| Piece | Role |
| --- | --- |
| [`src/lib/nav.ts`](../src/lib/nav.ts) | `NavLink` / `NavMenu` / `NavItem` union |
| [`src/lib/siteNavigation.ts`](../src/lib/siteNavigation.ts) | Query, `asNavItems`, `pageLinks`, `flattenPageLinks` |
| [`src/components/Navlinks.astro`](../src/components/Navlinks.astro) | Leaf links + `<details>` submenu |
| [`src/layouts/Layout.astro`](../src/layouts/Layout.astro) | Fetches nav; header gets menus, footer gets flattened links |

## Common pitfalls

| Symptom | Likely cause |
| --- | --- |
| Field is `undefined` at runtime | Omitted from the GROQ projection |
| New Studio object never appears | Normalizer requires a leaf-only field (for example `href`) and skips parents |
| TypeGen types look wrong / old | Stale `schema.json`; re-extract from Studio |
| No generated `*_QUERY_RESULT` | Query not assigned to a `defineQuery(...)` variable |
| Page types drift from Sanity | Hand-written `{ _id: string; title: string }` in `.astro` instead of lib aliases |

## Where to look

| Topic | Location |
| --- | --- |
| Architecture and lib list | [AGENTS.md](../AGENTS.md) |
| TypeGen, aliases, `null` vs `undefined` | [TYPES.md](TYPES.md) |
| Env / project / dataset | [`.env.example`](../.env.example) |
| Shared GROQ fragments | [`src/lib/groq.ts`](../src/lib/groq.ts) |
| Singleton site nav | [`src/lib/siteNavigation.ts`](../src/lib/siteNavigation.ts) |
| Catalog / entity hubs | `src/lib/people.ts`, `places.ts`, `subjects.ts`, `organizations.ts`, … |
