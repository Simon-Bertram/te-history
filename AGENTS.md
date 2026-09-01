# te-history

Public catalog for the Tredyffrin Easttown Historical Society: History Quarterly, photographs, documents, people, places, and research.

## Goal

Fetch structured content from the Sanity Content Lake and render it in Astro pages and components. Visitors should feel like scholars in a private vault, not users of a database.

This is not a Next.js app, not a React SPA, and not a shadcn project. Do not introduce those stacks.

## Stack

- **Astro 7** pages and components, adapter `@astrojs/cloudflare`
- **Sanity** via `@sanity/astro` (`sanity:client`, GROQ). Project and dataset are already set in `astro.config.mjs`
- **Tailwind 4** tokens in `src/styles/global.css` (Curated Manuscript)
- **Wrangler** (`wrangler.jsonc`) for Workers deploy
- **Bun** (`bun.lock`). Tests use `bun:test`

## Commands

Use `bun` / `bunx` for every install, script, binary, and one-off CLI. Do not use `npm`, `npx`, `yarn`, or `pnpm` unless no Bun equivalent exists — if that happens, say so.

| Task | Command |
| --- | --- |
| Install | `bun install` |
| Dev / build / preview | `bun run dev` / `bun run build` / `bun run preview` |
| Dev in background | `bunx astro dev --background` |
| Dev server control | `bunx astro dev stop` / `status` / `logs` |
| Worker types | `bun run generate-types` or `bunx wrangler types` |
| Tests | `bun test` |
| Skills CLI | `bunx skills add …` |

## Architecture

GROQ helpers in `src/lib/` (`catalog.ts`, `collections.ts`, `search.ts`, `siteNavigation.ts`) call `sanityClient.fetch`. Pages in `src/pages/` import those helpers and render `.astro` components. Prefer existing lib functions over new ad-hoc GROQ in pages.

- Images: `urlFor` in `src/lib/imageUrl.ts` (`@sanity/image-url`)
- Rich text: `astro-portabletext` on research and document detail pages
- Catalog routes: `export const prerender = false` (Cloudflare on-demand rendering)
- Content lives in Sanity. Do not add Astro content collections
- Public UI is `.astro`. React is a Sanity Studio dependency, not the public frontend

**Sanity types:** `historicalImage`, `primarySource`, `quarterlyIssue`, `quarterlyArticle`, `researchArticle`, `person`, `location`, `township`, `category`.

## Design

Follow [docs/DESIGN.md](docs/DESIGN.md) and tokens in `src/styles/global.css`. Newsreader (`font-display`) for headlines; Public Sans (`font-sans`) for UI and metadata.

- Section with `bg-surface-container-low` / `bg-surface-container`, not 1px solid borders
- Ghost borders only when needed for a11y: `outline-variant` at low opacity
- Metadata chips: `bg-secondary-fixed` / `text-on-secondary-fixed`
- Rounded `sm` or none — not `lg`/`xl`. No 100% black; use `on-surface` / `on-background`

Do not invent a new look or apply generic dashboard/shadcn layouts.

## Search and catalogs

Follow [docs/SEARCH.md](docs/SEARCH.md). URL-first GET params (`/search?q=`, `/images?township=&location=&subject=&decade=&sort=&page=`). No TanStack Query, SWR, or React search islands. Do not add Pagefind until detail pages are statically generated.

Facet lists: Tredyffrin/Easttown first (`sortTownshipsFirst`); fuzzy subjects last (`sortSubjectsDemoteFuzzy`). Limits live in `src/lib/limits.ts`.

## Code style

Match existing `.ts` / `.astro` files: tabs, single quotes, no semicolons, strict TypeScript.

## Do not

- Commit `.env` or secrets
- Add Durable Objects, D1, KV, or other Cloudflare bindings unless asked
- Use Astro i18n unless asked (this site is English)
