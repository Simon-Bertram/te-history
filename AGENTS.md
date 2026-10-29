# te-history

Public catalog for the Tredyffrin Easttown Historical Society: History Quarterly, photographs, documents, people, places, and research.

## Goal

Fetch structured content from the Sanity Content Lake and render it in Astro pages and components. Visitors should feel like scholars in a private vault, not users of a database.

This is not a Next.js app, not a React SPA, and not a shadcn project. Do not introduce those stacks.

## Stack

- **Astro 7** pages and components, adapter `@astrojs/cloudflare`
- **Sanity** via `@sanity/astro` (`sanity:client`, GROQ). `site`, project, and dataset come from `PUBLIC_SITE_URL` and `PUBLIC_SANITY_*` (see `.env.example`); `astro.config.mjs` loads them with Vite `loadEnv`.
- **Tailwind 4** tokens in `src/styles/global.css` (Curated Manuscript)
- **Wrangler** (`wrangler.jsonc`) for Workers deploy
- **Bun** (`bun.lock`). Tests use `bun:test`

## Commands

Use `bun` / `bunx` for every install, script, binary, and one-off CLI. Do not use `npm`, `npx`, `yarn`, or `pnpm` unless no Bun equivalent exists — if that happens, say so.

| Task | Command |
| --- | --- |
| Install | `bun install` |
| Dev / build / preview | `bun run dev` / `bun run build` / `bun run preview` |
| Deploy | `bun run deploy` (`astro build` then `wrangler deploy`) |
| Dev in background | `bunx astro dev --background` |
| Dev server control | `bunx astro dev stop` / `status` / `logs` |
| Worker types | `bun run generate-types` or `bunx wrangler types` |
| Sanity TypeGen | `bun run typegen` |
| Type check | `bun run check` |
| Tests | `bun test` |
| Skills CLI | `bunx skills add …` |

## Architecture

GROQ helpers in `src/lib/` (`catalog.ts`, `documents.ts`, `people.ts`, `places.ts`, `organizations.ts`, `quarterly.ts`, `research.ts`, `subjects.ts`, `search.ts`, `siteNavigation.ts`) call `sanityClient.fetch`. Pages import those helpers and render `.astro` components. Prefer existing lib functions over new ad-hoc GROQ in pages. Catalog links go through `hrefFor` in `href.ts`; image/document facets share `buildFacetQuery` in `facets.ts`. People, places, subjects, and organizations use `slug.current` when present, otherwise `_id` (old `_id` URLs 301 to the slug). Images and documents use `archiveId`.

Follow [docs/TYPES.md](docs/TYPES.md) for TypeGen, `defineQuery`, and catalog result types. Do not re-declare `{ _id: string; title: string }` in pages.

- Images: `urlFor` / `catalogGridSrc` / `catalogDetailSrc` in `src/lib/imageUrl.ts` (`@sanity/image-url`, `auto('format')`, srcset)
- Rich text: `astro-portabletext` via `PortableTextBody.astro` (`historicalImageEmbed` in research body/notes and document transcription)
- **Static by default** (`output: 'static'`). `site` is required for sitemap, canonicals, and Open Graph. Detail hubs use `getStaticPaths`. `export const prerender = false` only on `/search`, `/images`, `/documents`, `/research`, and `/organizations` (URL-first GET facets). Those SSR routes set `Cache-Control` via `setSsrCacheControl`.
- `useCdn: false` — build against the Content Lake, not a stale API CDN snapshot
- Content lives in Sanity. Do not add Astro content collections
- Public UI is `.astro`. Do not embed Sanity Studio on this site. Keep the `sanity` package for `bun run typegen` only.

**Sanity types:** `historicalImage`, `primarySource`, `quarterlyIssue`, `quarterlyArticle`, `researchArticle`, `person`, `location`, `township`, `category`, `organization`, `business`.

## Design

Follow [docs/DESIGN.md](docs/DESIGN.md) and tokens in `src/styles/global.css`. Newsreader (`font-display`) for headlines; Public Sans (`font-sans`) for UI and metadata.

- Section with `bg-surface-container-low` / `bg-surface-container`, not 1px solid borders
- Ghost borders only when needed for a11y: `outline-variant` at low opacity
- Metadata chips: `bg-secondary-fixed` / `text-on-secondary-fixed`
- Rounded `sm` or none — not `lg`/`xl`. No 100% black; use `on-surface` / `on-background`

Do not invent a new look or apply generic dashboard/shadcn layouts.

## Search and catalogs

Follow [docs/SEARCH.md](docs/SEARCH.md). URL-first GET params (`/search?q=`, `/images?township=&location=&subject=&decade=&sort=&page=`). No TanStack Query, SWR, or React search islands. Image, document, and research **detail** pages are prerendered; Pagefind over `dist/` is a follow-up, not a replacement for GROQ Archive ID search.

Facet lists: Tredyffrin/Easttown first (`sortTownshipsFirst`); fuzzy subjects last (`sortSubjectsDemoteFuzzy`). Limits live in `src/lib/limits.ts`.

## Code style

Match existing `.ts` / `.astro` files: tabs, single quotes, no semicolons, strict TypeScript.

## Do not

- Commit `.env` or secrets (copy `.env.example` locally)
- Add Durable Objects, D1, KV, or other Cloudflare bindings unless asked
- Use Astro i18n unless asked (this site is English)
