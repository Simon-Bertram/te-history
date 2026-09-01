import {sanityClient} from 'sanity:client'

import {SEARCH_RESULT_LIMIT} from './limits'

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

const ARCHIVE_ID_PATTERN = /^[A-Za-z]{1,8}\d+[A-Za-z0-9+-]*$/
const PUBLIC_INCOMING = `count(*[_type in ["historicalImage", "primarySource", "quarterlyArticle", "researchArticle"] && references(^._id)])`

function hrefFor(doc: {
	_id?: string
	_type: string
	archiveId?: string
	slug?: string
	sourceUrl?: string
}): string {
	if (doc._type === 'historicalImage' && doc.archiveId) return `/images/${doc.archiveId}`
	if (doc._type === 'primarySource' && doc.archiveId) return `/documents/${doc.archiveId}`
	if (doc._type === 'researchArticle' && doc.slug) return `/research/${doc.slug}`
	if (doc._type === 'quarterlyArticle' && doc.sourceUrl) return doc.sourceUrl
	if (doc._type === 'person' && doc._id) return `/people/${doc._id}`
	if ((doc._type === 'location' || doc._type === 'township') && doc._id) {
		return `/places/${doc._id}`
	}
	return '/search'
}

export async function searchCatalog(rawQuery: string): Promise<GroupedSearch> {
	const query = rawQuery.trim()
	if (!query) return {query, groups: []}

	const wildcard = `*${query}*`
	const isArchiveId = ARCHIVE_ID_PATTERN.test(query)

	const result = await sanityClient.fetch(
		/* groq */ `{
			"images": *[_type == "historicalImage" && (archiveId match $exact || title match $q || archiveId match $q)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
				_id, _type, title, archiveId
			},
			"documents": *[_type == "primarySource" && (archiveId match $exact || title match $q)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
				_id, _type, title, archiveId, newspaper
			},
			"quarterly": *[_type == "quarterlyArticle" && (title match $q || sourceKey match $exact)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
				_id, _type, title, sourceUrl, sourceKey
			},
			"research": *[_type == "researchArticle" && (title match $q || archiveId match $exact)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
				_id, _type, title, "slug": slug.current, archiveId
			},
			"people": *[_type == "person" && (firstName match $q || lastName match $q) && ${PUBLIC_INCOMING} > 0] | order(lastName asc)[0...${SEARCH_RESULT_LIMIT}]{
				_id, _type, firstName, lastName
			},
			"places": *[_type in ["township", "location"] && name match $q] | order(name asc)[0...${SEARCH_RESULT_LIMIT}]{
				_id, _type, name
			}
		}`,
		{q: wildcard, exact: query},
	)

	const toHits = (
		docs: Array<Record<string, string | undefined>> | undefined,
		titleOf: (doc: Record<string, string | undefined>) => string,
		metaOf?: (doc: Record<string, string | undefined>) => string | undefined,
	): SearchHit[] =>
		(docs ?? []).map((doc) => ({
			_id: doc._id ?? '',
			_type: doc._type ?? '',
			title: titleOf(doc),
			href: hrefFor(doc as {
				_id?: string
				_type: string
				archiveId?: string
				slug?: string
				sourceUrl?: string
			}),
			meta: metaOf?.(doc),
		}))

	let images = toHits(result?.images, (doc) => doc.title ?? 'Untitled image', (doc) => doc.archiveId)
	if (isArchiveId) {
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
