import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	LATEST_QUARTERLY_ISSUE_QUERY_RESULT,
	QUARTERLY_ISSUES_QUERY_RESULT,
} from '../../sanity.types'
import {LATEST_ISSUE_ARTICLE_LIMIT} from './limits'

export type LatestQuarterlyIssue = NonNullable<LATEST_QUARTERLY_ISSUE_QUERY_RESULT>
export type QuarterlyIssueArticle = LatestQuarterlyIssue['articles'][number]
export type QuarterlyIssueListItem = QUARTERLY_ISSUES_QUERY_RESULT[number]

export const LATEST_QUARTERLY_ISSUE_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyIssue" && count(*[_type == "quarterlyArticle" && issueRef._ref == ^._id]) > 0] | order(volume desc, issueNumber desc)[0]{
		_id,
		volume,
		issueNumber,
		season,
		coverImage,
		"articles": *[_type == "quarterlyArticle" && issueRef._ref == ^._id] | order(startPage asc)[0...${LATEST_ISSUE_ARTICLE_LIMIT}]{
			_id, title, authorText, startPage, sourceUrl
		}
	}
`)

export const QUARTERLY_ISSUES_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyIssue"] | order(volume desc, issueNumber desc){
		_id, volume, issueNumber, season,
		"articles": *[_type == "quarterlyArticle" && issueRef._ref == ^._id] | order(startPage asc){
			_id, title, authorText, startPage, sourceUrl
		}
	}
`)

export async function getLatestQuarterlyIssue(): Promise<LatestQuarterlyIssue | null> {
	return sanityClient.fetch(LATEST_QUARTERLY_ISSUE_QUERY)
}

export async function getQuarterlyIssues(): Promise<QuarterlyIssueListItem[]> {
	return (await sanityClient.fetch(QUARTERLY_ISSUES_QUERY)) ?? []
}
