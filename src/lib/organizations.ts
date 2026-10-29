import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	ORGANIZATION_HUB_QUERY_RESULT,
	ORGANIZATIONS_PAGE_QUERY_RESULT,
} from '../../sanity.types'
import {pageSlice} from './facets'
import {
	ENTITY_SLUG_MATCH,
	ORGANIZATION_HUB_PROJECTION,
	ORGANIZATION_LIST_PROJECTION,
} from './groq'
import {hubStaticPaths} from './href'
import {ORGANIZATIONS_PAGE_SIZE} from './limits'
import {organizationLetterFilter, parseOrganizationLetter} from './organizationLetter'

export {parseOrganizationLetter} from './organizationLetter'

export type OrganizationsPage = ORGANIZATIONS_PAGE_QUERY_RESULT
export type OrganizationListItem = OrganizationsPage['organizations'][number]
export type OrganizationHub = NonNullable<ORGANIZATION_HUB_QUERY_RESULT>

const ENTITY_TYPE_FILTER =
	'_type in ["organization", "business"] && defined(name) && name != ""'

export const ORGANIZATIONS_PAGE_QUERY = defineQuery(/* groq */ `{
	"total": count(*[${ENTITY_TYPE_FILTER}]),
	"organizations": *[${ENTITY_TYPE_FILTER}] | order(name asc)[0...${ORGANIZATIONS_PAGE_SIZE}]{
		${ORGANIZATION_LIST_PROJECTION}
	}
}`)

export const ORGANIZATION_HUB_QUERY = defineQuery(/* groq */ `
	*[_type in ["organization", "business"] && ${ENTITY_SLUG_MATCH}][0]{
		${ORGANIZATION_HUB_PROJECTION}
	}
`)

export const ORGANIZATION_HUB_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type in ["organization", "business"] && defined(name) && name != ""]{
		${ORGANIZATION_HUB_PROJECTION}
	}
`)

export async function getOrganizationsPage(params: {
	q?: string
	subject?: string
	letter?: string
	page: number
}): Promise<OrganizationsPage> {
	const filters = [ENTITY_TYPE_FILTER]
	const groqParams: Record<string, string | number> = {}
	const letter = parseOrganizationLetter(params.letter)

	if (params.q?.trim()) {
		filters.push('name match $q')
		groqParams.q = `*${params.q.trim()}*`
	}
	if (params.subject?.trim()) {
		filters.push('$subjectId in subjects[]._ref')
		groqParams.subjectId = params.subject.trim()
	}
	const letterClause = organizationLetterFilter(letter)
	if (letterClause) filters.push(letterClause)

	const page = params.page > 0 ? params.page : 1
	const {start, end} = pageSlice(page, ORGANIZATIONS_PAGE_SIZE)
	const filter = filters.join(' && ')

	// @sanity-typegen-ignore — facet filters and page slices are interpolated
	const query = /* groq */ `{
		"total": count(*[${filter}]),
		"organizations": *[${filter}] | order(name asc)[${start}...${end}]{
			${ORGANIZATION_LIST_PROJECTION}
		}
	}`
	return sanityClient.fetch(query, groqParams) as Promise<OrganizationsPage>
}

export async function getOrganizationHub(slug: string): Promise<OrganizationHub | null> {
	return sanityClient.fetch(ORGANIZATION_HUB_QUERY, {slug})
}

export async function getOrganizationHubPaths() {
	const rows = await sanityClient.fetch(ORGANIZATION_HUB_PATHS_QUERY)
	return hubStaticPaths(rows, '/organizations', (organization) => ({organization}))
}
