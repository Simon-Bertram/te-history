import {hrefFor} from './href'

export interface SearchHit {
	_id: string
	_type: string
	title: string
	href: string
	meta?: string
}

export interface GroupedSearch {
	query: string
	groups: {label: string; type: string; hits: SearchHit[]}[]
}

export interface SearchCatalogPayload {
	images?: SearchDoc[] | null
	documents?: SearchDoc[] | null
	quarterly?: SearchDoc[] | null
	research?: SearchDoc[] | null
	people?: SearchDoc[] | null
	places?: SearchDoc[] | null
}

type SearchDoc = {
	_id: string
	_type: string
	title?: string | null
	archiveId?: string | null
	newspaper?: string | null
	sourceKey?: string | null
	slug?: string | null
	firstName?: string | null
	lastName?: string | null
	name?: string | null
}

const ARCHIVE_ID_PATTERN = /^[A-Za-z]{1,8}\d+[A-Za-z0-9+-]*$/

function toHits(
	docs: SearchDoc[] | null | undefined,
	titleOf: (doc: SearchDoc) => string,
	metaOf?: (doc: SearchDoc) => string | null | undefined,
): SearchHit[] {
	return (docs ?? []).map((doc) => ({
		_id: doc._id,
		_type: doc._type,
		title: titleOf(doc),
		href: hrefFor({
			_id: doc._id,
			_type: doc._type,
			archiveId: doc.archiveId ?? undefined,
			slug: doc.slug ?? undefined,
		}),
		meta: metaOf?.(doc) ?? undefined,
	}))
}

/** Group GROQ hits and drop empty types. Archive-ID queries pin an exact image match first. */
export function groupSearchHits(
	rawQuery: string,
	result: SearchCatalogPayload | null | undefined,
): GroupedSearch {
	const query = rawQuery.trim()
	if (!query) return {query, groups: []}

	let images = toHits(
		result?.images,
		(doc) => doc.title ?? 'Untitled image',
		(doc) => doc.archiveId,
	)
	if (ARCHIVE_ID_PATTERN.test(query)) {
		images = [...images].sort((a, b) => {
			const aExact = a.meta?.toLowerCase() === query.toLowerCase() ? 0 : 1
			const bExact = b.meta?.toLowerCase() === query.toLowerCase() ? 0 : 1
			return aExact - bExact
		})
	}

	const groups = [
		{label: 'Images', type: 'historicalImage', hits: images},
		{
			label: 'Documents',
			type: 'primarySource',
			hits: toHits(result?.documents, (doc) => doc.title ?? 'Untitled', (doc) => doc.newspaper),
		},
		{
			label: 'Quarterly',
			type: 'quarterlyArticle',
			hits: toHits(result?.quarterly, (doc) => doc.title ?? 'Untitled', (doc) => doc.sourceKey),
		},
		{
			label: 'Research',
			type: 'researchArticle',
			hits: toHits(result?.research, (doc) => doc.title ?? 'Untitled'),
		},
		{
			label: 'People',
			type: 'person',
			hits: toHits(
				result?.people,
				(doc) => [doc.firstName, doc.lastName].filter(Boolean).join(' ') || 'Unnamed',
			),
		},
		{
			label: 'Places',
			type: 'place',
			hits: toHits(result?.places, (doc) => doc.name ?? 'Unnamed'),
		},
	].filter((group) => group.hits.length > 0)

	return {query, groups}
}
