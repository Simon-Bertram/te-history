/**
 * Mark an on-demand response as 404.
 * Do not rewrite to the static `/404` route — Astro forbids rewriting SSR
 * pages to prerendered HTML.
 */
export function rewriteNotFound(astro: {response: {status?: number}}) {
	astro.response.status = 404
}
