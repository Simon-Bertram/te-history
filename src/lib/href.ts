export type CatalogRef = {
	_type: string
	_id?: string | null
	archiveId?: string | null
	slug?: string | null
	sourceUrl?: string | null
}

type HrefBuilder = (doc: CatalogRef) => string | undefined

/** New catalog type = one map entry. */
const HREF_FOR: Record<string, HrefBuilder> = {
	historicalImage: (doc) => (doc.archiveId ? `/images/${doc.archiveId}` : undefined),
	primarySource: (doc) => (doc.archiveId ? `/documents/${doc.archiveId}` : undefined),
	researchArticle: (doc) => (doc.slug ? `/research/${doc.slug}` : undefined),
	quarterlyArticle: (doc) => doc.sourceUrl ?? undefined,
	person: (doc) => (doc._id ? `/people/${doc._id}` : undefined),
	location: (doc) => (doc._id ? `/places/${doc._id}` : undefined),
	township: (doc) => (doc._id ? `/places/${doc._id}` : undefined),
	category: (doc) => (doc._id ? `/subjects/${doc._id}` : undefined),
}

export function hrefFor(doc: CatalogRef, fallback = '/search'): string {
	return HREF_FOR[doc._type]?.(doc) ?? fallback
}

export function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href)
}
