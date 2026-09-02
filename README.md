# te-history

Public catalog for the Tredyffrin Easttown Historical Society: History Quarterly, photographs, documents, people, places, and research.

Content comes from Sanity. The site is Astro 7 with the Cloudflare adapter: static pages plus SSR on `/search`, `/images`, `/documents`, and `/research`.

## Setup

```sh
bun install
cp .env.example .env
```

`PUBLIC_SITE_URL` must be the live origin (sitemap, canonicals, Open Graph). `PUBLIC_SANITY_*` points at the Content Lake. Do not commit `.env`.

## Commands

| Command | Action |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Local dev server |
| `bun run build` | Production build to `./dist/` |
| `bun run preview` | Preview the Worker locally |
| `bun run deploy` | Build and deploy to Cloudflare Workers |
| `bun run check` | Type check |
| `bun test` | Run tests |

## Deploy to Cloudflare Workers

The Worker is already configured in `wrangler.jsonc` (`name`: `te-history`). Live origin: [https://te-history.simonbertram.workers.dev](https://te-history.simonbertram.workers.dev).

1. Log in once: `bunx wrangler login` then `bunx wrangler whoami`.
2. Set `PUBLIC_SITE_URL` in `.env` to the origin you will serve (after the first deploy this is `https://te-history.<your-account-subdomain>.workers.dev`).
3. Deploy:

```sh
bun run deploy
```

That runs `astro build` then `wrangler deploy`. Static detail pages are generated at build time against Sanity; SSR catalog and search routes query Sanity on request.

If the first deploy used a placeholder `PUBLIC_SITE_URL`, update `.env` to the printed workers.dev URL and run `bun run deploy` again so canonicals and the sitemap match.

Optional checks after deploy: home, a detail page, `/search?q=…`, `/images`, `/documents`, `/research`, a missing path (custom 404), and `robots.txt`. Tail logs with `bunx wrangler tail`.
