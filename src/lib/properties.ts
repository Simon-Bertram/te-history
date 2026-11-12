import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	PROPERTIES_PAGE_QUERY_RESULT,
	PROPERTY_HUB_QUERY_RESULT,
} from '../../sanity.types'
import {pageSlice} from './facets'
import {
	ENTITY_SLUG_MATCH,
	PROPERTY_HUB_PROJECTION,
	PROPERTY_LIST_PROJECTION,
} from './groq'
import {hubStaticPaths} from './href'
import {PROPERTIES_PAGE_SIZE} from './limits'
import {
	letterFieldFilter,
	parseOrganizationLetter,
} from './organizationLetter'
import {parsePropertyType} from './propertyTypes'

export {parseOrganizationLetter as parsePropertyLetter} from './organizationLetter'
export {
	parsePropertyType,
	PROPERTY_TYPES,
	propertyTypeLabel,
	type PropertyTypeValue,
} from './propertyTypes'

export type PropertiesPage = PROPERTIES_PAGE_QUERY_RESULT
export type PropertyListItem = PropertiesPage['properties'][number]
export type PropertyHub = NonNullable<PROPERTY_HUB_QUERY_RESULT>

const PROPERTY_FILTER =
	'_type == "property" && defined(historicalName) && historicalName != ""'

export const PROPERTIES_PAGE_QUERY = defineQuery(/* groq */ `{
	"total": count(*[${PROPERTY_FILTER}]),
	"properties": *[${PROPERTY_FILTER}] | order(historicalName asc)[0...${PROPERTIES_PAGE_SIZE}]{
		${PROPERTY_LIST_PROJECTION}
	}
}`)

export const PROPERTY_HUB_QUERY = defineQuery(/* groq */ `
	*[_type == "property" && ${ENTITY_SLUG_MATCH}][0]{
		${PROPERTY_HUB_PROJECTION}
	}
`)

export const PROPERTY_HUB_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "property" && defined(historicalName) && historicalName != ""]{
		${PROPERTY_HUB_PROJECTION}
	}
`)

export async function getPropertiesPage(params: {
	q?: string
	type?: string
	township?: string
	letter?: string
	page: number
}): Promise<PropertiesPage> {
	const filters = [PROPERTY_FILTER]
	const groqParams: Record<string, string | number> = {}
	const letter = parseOrganizationLetter(params.letter)
	const type = parsePropertyType(params.type)

	if (params.q?.trim()) {
		filters.push('historicalName match $q')
		groqParams.q = `*${params.q.trim()}*`
	}
	if (type) {
		filters.push('propertyType == $propertyType')
		groqParams.propertyType = type
	}
	if (params.township?.trim()) {
		filters.push('township._ref == $townshipId')
		groqParams.townshipId = params.township.trim()
	}
	const letterClause = letterFieldFilter('historicalName', letter)
	if (letterClause) filters.push(letterClause)

	const page = params.page > 0 ? params.page : 1
	const {start, end} = pageSlice(page, PROPERTIES_PAGE_SIZE)
	const filter = filters.join(' && ')

	// @sanity-typegen-ignore — facet filters and page slices are interpolated
	const query = /* groq */ `{
		"total": count(*[${filter}]),
		"properties": *[${filter}] | order(historicalName asc)[${start}...${end}]{
			${PROPERTY_LIST_PROJECTION}
		}
	}`
	return sanityClient.fetch(query, groqParams) as Promise<PropertiesPage>
}

export async function getPropertyHub(slug: string): Promise<PropertyHub | null> {
	return sanityClient.fetch(PROPERTY_HUB_QUERY, {slug})
}

export async function getPropertyHubPaths() {
	const rows = await sanityClient.fetch(PROPERTY_HUB_PATHS_QUERY)
	return hubStaticPaths(rows, '/properties', (property) => ({property}))
}
