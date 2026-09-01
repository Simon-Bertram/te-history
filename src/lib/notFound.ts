export function rewriteNotFound(astro: {
	response: {status: number}
	rewrite: (path: string) => Promise<Response>
}) {
	astro.response.status = 404
	return astro.rewrite('/404')
}
