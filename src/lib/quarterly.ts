import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	LATEST_QUARTERLY_ISSUE_QUERY_RESULT,
	QUARTERLY_ARTICLE_BY_SLUG_QUERY_RESULT,
	QUARTERLY_ARTICLE_PATHS_QUERY_RESULT,
	QUARTERLY_ISSUES_QUERY_RESULT,
} from '../../sanity.types'
import {PORTABLE_TEXT_WITH_EMBEDS} from './groq'
import {slugStaticPaths} from './href'
import {LATEST_ISSUE_ARTICLE_LIMIT} from './limits'

export type LatestQuarterlyIssue = NonNullable<LATEST_QUARTERLY_ISSUE_QUERY_RESULT>
export type QuarterlyIssueArticle = LatestQuarterlyIssue['articles'][number]
export type QuarterlyIssueListItem = QUARTERLY_ISSUES_QUERY_RESULT[number]
export type QuarterlyArticleDetail = NonNullable<QUARTERLY_ARTICLE_BY_SLUG_QUERY_RESULT>
export type QuarterlyArticlePathRow = QUARTERLY_ARTICLE_PATHS_QUERY_RESULT[number]

const QUARTERLY_ARTICLE_LIST_PROJECTION = /* groq */ `
	_id, title, authorText, startPage, "slug": slug.current
`

const QUARTERLY_ARTICLE_DETAIL_PROJECTION = /* groq */ `
	_id,
	title,
	authorText,
	startPage,
	endPage,
	summary,
	"slug": slug.current,
	"issue": issueRef->{volume, issueNumber, season},
	"body": body${PORTABLE_TEXT_WITH_EMBEDS},
	"notesAndReferences": notesAndReferences${PORTABLE_TEXT_WITH_EMBEDS}
`

export const LATEST_QUARTERLY_ISSUE_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyIssue" && count(*[_type == "quarterlyArticle" && issueRef._ref == ^._id]) > 0] | order(volume desc, issueNumber desc)[0]{
		_id,
		volume,
		issueNumber,
		season,
		coverImage,
		"articles": *[_type == "quarterlyArticle" && issueRef._ref == ^._id] | order(startPage asc)[0...${LATEST_ISSUE_ARTICLE_LIMIT}]{
			${QUARTERLY_ARTICLE_LIST_PROJECTION}
		}
	}
`)

export const QUARTERLY_ISSUES_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyIssue"] | order(volume desc, issueNumber desc){
		_id, volume, issueNumber, season,
		"articles": *[_type == "quarterlyArticle" && issueRef._ref == ^._id] | order(startPage asc){
			${QUARTERLY_ARTICLE_LIST_PROJECTION}
		}
	}
`)

export const QUARTERLY_ARTICLE_BY_SLUG_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyArticle" && slug.current == $slug][0]{
		${QUARTERLY_ARTICLE_DETAIL_PROJECTION}
	}
`)

export const QUARTERLY_ARTICLE_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyArticle" && defined(slug.current)]{
		${QUARTERLY_ARTICLE_DETAIL_PROJECTION}
	}
`)

export async function getLatestQuarterlyIssue(): Promise<LatestQuarterlyIssue | null> {
	return sanityClient.fetch(LATEST_QUARTERLY_ISSUE_QUERY)
}

export async function getQuarterlyIssues(): Promise<QuarterlyIssueListItem[]> {
	return (await sanityClient.fetch(QUARTERLY_ISSUES_QUERY)) ?? []
}

export async function getQuarterlyArticleBySlug(
	slug: string,
): Promise<QuarterlyArticleDetail | null> {
	return sanityClient.fetch(QUARTERLY_ARTICLE_BY_SLUG_QUERY, {slug})
}

export async function getQuarterlyArticleStaticPaths() {
	const rows = await sanityClient.fetch(QUARTERLY_ARTICLE_PATHS_QUERY)
	return slugStaticPaths(rows, (article) => ({article}))
}
