import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import {ENTITY_SLUG, HAS_PUBLIC_INCOMING} from './groq'
import {SEARCH_RESULT_LIMIT} from './limits'
import {groupSearchHits, type GroupedSearch} from './searchGroups'

export type {GroupedSearch, SearchHit} from './searchGroups'

export const SEARCH_CATALOG_QUERY = defineQuery(/* groq */ `{
	"images": *[_type == "historicalImage" && (archiveId match $exact || title match $q || archiveId match $q)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
		_id, _type, title, archiveId
	},
	"documents": *[_type == "primarySource" && (archiveId match $exact || title match $q)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
		_id, _type, title, archiveId, newspaper
	},
	"quarterly": *[_type == "quarterlyArticle" && (title match $q || sourceKey match $exact || slug.current match $exact)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
		_id, _type, title, "slug": slug.current, sourceKey
	},
	"research": *[_type == "researchArticle" && (title match $q || archiveId match $exact)] | order(title asc)[0...${SEARCH_RESULT_LIMIT}]{
		_id, _type, title, "slug": slug.current, archiveId
	},
	"people": *[_type == "person" && (firstName match $q || lastName match $q) && ${HAS_PUBLIC_INCOMING}] | order(lastName asc)[0...${SEARCH_RESULT_LIMIT}]{
		_id, _type, firstName, lastName, "slug": ${ENTITY_SLUG}
	},
	"places": *[_type in ["township", "location"] && name match $q] | order(name asc)[0...${SEARCH_RESULT_LIMIT}]{
		_id, _type, name, "slug": ${ENTITY_SLUG}
	}
}`)

export async function searchCatalog(rawQuery: string): Promise<GroupedSearch> {
	const query = rawQuery.trim()
	if (!query) return groupSearchHits(query, null)

	const result = await sanityClient.fetch(SEARCH_CATALOG_QUERY, {
		q: `*${query}*`,
		exact: query,
	})
	return groupSearchHits(query, result)
}
