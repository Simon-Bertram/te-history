import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	FEATURED_RESEARCH_FALLBACK_QUERY_RESULT,
	RESEARCH_ARTICLES_QUERY_RESULT,
	RESEARCH_BY_SLUG_QUERY_RESULT,
} from '../../sanity.types'
import {PORTABLE_TEXT_WITH_EMBEDS} from './groq'
import {slugStaticPaths} from './href'
import {FEATURED_RESEARCH_LIMIT} from './limits'

export type FeaturedResearchArticle = FEATURED_RESEARCH_FALLBACK_QUERY_RESULT[number]
export type ResearchListItem = RESEARCH_ARTICLES_QUERY_RESULT[number]
export type ResearchArticleDetail = NonNullable<RESEARCH_BY_SLUG_QUERY_RESULT>

export const FEATURED_RESEARCH_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && featuredOnSite == true] | order(featuredRank asc, title asc)[0...${FEATURED_RESEARCH_LIMIT}]{
		_id, title, "slug": slug.current, featuredRank
	}
`)

export const FEATURED_RESEARCH_FALLBACK_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && defined(slug.current)] | order(title asc)[0...${FEATURED_RESEARCH_LIMIT}]{
		_id, title, "slug": slug.current
	}
`)

export const RESEARCH_ARTICLES_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && defined(slug.current)] | order(title asc){
		_id, title, "slug": slug.current
	}
`)

export const RESEARCH_BY_SLUG_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && slug.current == $slug][0]{
		_id, title,
		"body": body${PORTABLE_TEXT_WITH_EMBEDS},
		"notesAndReferences": notesAndReferences${PORTABLE_TEXT_WITH_EMBEDS}
	}
`)

export const RESEARCH_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && defined(slug.current)]{
		_id, title,
		"body": body${PORTABLE_TEXT_WITH_EMBEDS},
		"notesAndReferences": notesAndReferences${PORTABLE_TEXT_WITH_EMBEDS},
		"slug": slug.current
	}
`)

export async function getFeaturedResearch(): Promise<FeaturedResearchArticle[]> {
	const featured = await sanityClient.fetch(FEATURED_RESEARCH_QUERY)
	if (featured?.length) return featured
	return (await sanityClient.fetch(FEATURED_RESEARCH_FALLBACK_QUERY)) ?? []
}

export async function getResearchArticles(params?: {
	townshipId?: string
	q?: string
}): Promise<ResearchListItem[]> {
	const townshipId = params?.townshipId?.trim() ?? ''
	const q = params?.q?.trim() ?? ''
	if (!townshipId && !q) {
		return (await sanityClient.fetch(RESEARCH_ARTICLES_QUERY)) ?? []
	}

	const filters = ['_type == "researchArticle"', 'defined(slug.current)']
	const groqParams: Record<string, string> = {}
	if (townshipId) {
		filters.push('$townshipId in townships[]._ref')
		groqParams.townshipId = townshipId
	}
	if (q) {
		filters.push('title match $q')
		groqParams.q = `*${q}*`
	}
	const filter = filters.join(' && ')
	// @sanity-typegen-ignore — township and title filters are interpolated at runtime
	const query = /* groq */ `*[${filter}] | order(title asc){_id, title, "slug": slug.current}`
	return (await sanityClient.fetch(query, groqParams)) ?? []
}

export async function getResearchBySlug(
	slug: string,
): Promise<ResearchArticleDetail | null> {
	return sanityClient.fetch(RESEARCH_BY_SLUG_QUERY, {slug})
}

export async function getResearchStaticPaths() {
	const rows = await sanityClient.fetch(RESEARCH_PATHS_QUERY)
	return slugStaticPaths(rows, (article) => ({article}))
}
