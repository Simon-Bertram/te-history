export type CatalogRef = {
	_type: string
	_id?: string | null
	archiveId?: string | null
	slug?: string | null
	sourceUrl?: string | null
}

type HrefBuilder = (doc: CatalogRef) => string | undefined

function slugPath(prefix: string, doc: CatalogRef) {
	const slug = doc.slug || doc._id
	return slug ? `${prefix}/${slug}` : undefined
}

/** New catalog type = one map entry. */
const HREF_FOR: Record<string, HrefBuilder> = {
	historicalImage: (doc) => (doc.archiveId ? `/images/${doc.archiveId}` : undefined),
	primarySource: (doc) => (doc.archiveId ? `/documents/${doc.archiveId}` : undefined),
	researchArticle: (doc) => (doc.slug ? `/research/${doc.slug}` : undefined),
	quarterlyArticle: (doc) => doc.sourceUrl ?? undefined,
	person: (doc) => slugPath('/people', doc),
	location: (doc) => slugPath('/places', doc),
	township: (doc) => slugPath('/places', doc),
	category: (doc) => slugPath('/subjects', doc),
}

export function hrefFor(doc: CatalogRef, fallback = '/search'): string {
	return HREF_FOR[doc._type]?.(doc) ?? fallback
}

export function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href)
}

/** Prerender params for image and document detail pages. */
export function archiveIdStaticPaths<T extends {archiveId?: string | null}, P>(
	rows: T[] | null | undefined,
	propsOf: (row: T & {archiveId: string}) => P,
): Array<{params: {archiveId: string}; props: P}> {
	return (rows ?? [])
		.filter((row): row is T & {archiveId: string} => Boolean(row.archiveId))
		.map((row) => ({params: {archiveId: row.archiveId}, props: propsOf(row)}))
}

/** Prerender params for research detail pages. */
export function slugStaticPaths<T extends {slug?: string | null}, P>(
	rows: T[] | null | undefined,
	propsOf: (row: T & {slug: string}) => P,
): Array<{params: {slug: string}; props: P}> {
	return (rows ?? [])
		.filter((row): row is T & {slug: string} => Boolean(row.slug))
		.map((row) => ({params: {slug: row.slug}, props: propsOf(row)}))
}

/** Canonical slug path plus a 301 from `_id` when they differ. */
export function hubStaticPaths<T extends {_id: string; slug?: string | null}, P>(
	rows: T[] | null | undefined,
	prefix: '/people' | '/places' | '/subjects',
	propsOf: (row: T) => P,
): Array<{params: {slug: string}; props: P} | {params: {slug: string}; redirect: string}> {
	return (rows ?? []).flatMap((row) => {
		const slug = row.slug || row._id
		const paths: Array<
			{params: {slug: string}; props: P} | {params: {slug: string}; redirect: string}
		> = [{params: {slug}, props: propsOf(row)}]
		if (slug !== row._id) {
			paths.push({params: {slug: row._id}, redirect: `${prefix}/${slug}`})
		}
		return paths
	})
}
