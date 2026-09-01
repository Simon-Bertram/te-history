/** Edge TTL for identical search/facet URLs. Browsers revalidate; HTML assets are already static. */
export const SSR_CACHE_CONTROL =
	'public, max-age=0, s-maxage=60, stale-while-revalidate=600'

export function setSsrCacheControl(headers: Headers) {
	headers.set('Cache-Control', SSR_CACHE_CONTROL)
}
