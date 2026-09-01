import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	LOCATIONS_QUERY_RESULT,
	SUBJECTS_QUERY_RESULT,
	TOWNSHIPS_QUERY_RESULT,
} from '../../sanity.types'
import type {CatalogImage} from './imageHighlights'
import {mergeFeaturedWithFallback} from './imageHighlights'
import {IMAGE_PROJECTION} from './groq'
import {
	HOME_IMAGE_LIMIT,
	IMAGES_PAGE_SIZE,
	parseImageSort,
	sortSubjectsDemoteFuzzy,
	sortTownshipsFirst,
	type ImageSort,
} from './limits'

export type TownshipOption = TOWNSHIPS_QUERY_RESULT[number]
export type LocationOption = LOCATIONS_QUERY_RESULT[number]
export type SubjectOption = SUBJECTS_QUERY_RESULT[number]
export type {CatalogImage}

export const FEATURED_IMAGES_QUERY = defineQuery(/* groq */ `
	*[_type == "historicalImage" && featuredOnSite == true] | order(featuredRank asc, title asc)[0...24]{
		${IMAGE_PROJECTION}
	}
`)

export const FALLBACK_IMAGES_QUERY = defineQuery(/* groq */ `
	*[_type == "historicalImage" && defined(imageFile.asset) && defined(dateTaken.year) && defined(description) && defined(title) && !(title match "Untitled*") && !(archiveId match "OLA*")] | order(dateTaken.year asc)[0...80]{
		${IMAGE_PROJECTION}
	}
`)

export const TOWNSHIPS_QUERY = defineQuery(/* groq */ `
	*[_type == "township"] | order(name asc){_id, name}
`)

export const LOCATIONS_QUERY = defineQuery(/* groq */ `
	*[_type == "location"] | order(name asc){_id, name}
`)

export const SUBJECTS_QUERY = defineQuery(/* groq */ `
	*[_type == "category"] | order(title asc){_id, title}
`)

const IMAGE_SORT_CLAUSE: Record<ImageSort, string> = {
	'date-desc': 'dateTaken.year desc, title asc',
	'date-asc': 'dateTaken.year asc, title asc',
	title: 'title asc',
}

export async function getHighlightImages(limit = HOME_IMAGE_LIMIT): Promise<CatalogImage[]> {
	const [featured, fallback] = await Promise.all([
		sanityClient.fetch(FEATURED_IMAGES_QUERY),
		sanityClient.fetch(FALLBACK_IMAGES_QUERY),
	])
	return mergeFeaturedWithFallback(featured ?? [], fallback ?? [], limit)
}

export interface ImageFacetParams {
	q?: string
	township?: string
	location?: string
	subject?: string
	decade?: string
	sort?: string
	page?: number
}

function parsePage(value: string | undefined): number {
	const page = Number(value)
	return Number.isInteger(page) && page > 0 ? page : 1
}

export async function getFilteredImages(params: ImageFacetParams): Promise<{
	images: CatalogImage[]
	total: number
	page: number
	pageSize: number
}> {
	const page = params.page && params.page > 0 ? params.page : 1
	const start = (page - 1) * IMAGES_PAGE_SIZE
	const end = start + IMAGES_PAGE_SIZE
	const sort = parseImageSort(params.sort)
	const filters = ['_type == "historicalImage"', 'defined(imageFile.asset)']
	const groqParams: Record<string, unknown> = {}

	if (params.q?.trim()) {
		filters.push(
			'(title match $q || archiveId match $q || description match $q)',
		)
		groqParams.q = `*${params.q.trim()}*`
	}
	if (params.township?.trim()) {
		filters.push('township._ref == $townshipId')
		groqParams.townshipId = params.township.trim()
	}
	if (params.location?.trim()) {
		filters.push('location._ref == $locationId')
		groqParams.locationId = params.location.trim()
	}
	if (params.subject?.trim()) {
		filters.push('$subjectId in subjects[]._ref')
		groqParams.subjectId = params.subject.trim()
	}
	if (params.decade?.trim()) {
		const decade = Number(params.decade)
		if (Number.isInteger(decade)) {
			filters.push(
				'defined(dateTaken.year) && dateTaken.year >= $decadeStart && dateTaken.year < $decadeEnd',
			)
			groqParams.decadeStart = decade
			groqParams.decadeEnd = decade + 10
		}
	}

	const filter = filters.join(' && ')
	// @sanity-typegen-ignore — facet filters are interpolated at runtime
	const query = /* groq */ `{
		"total": count(*[${filter}]),
		"images": *[${filter}] | order(${IMAGE_SORT_CLAUSE[sort]})[${start}...${end}]{${IMAGE_PROJECTION}}
	}`

	const result = await sanityClient.fetch<{total: number; images: CatalogImage[]}>(
		query,
		groqParams,
	)

	return {
		images: result?.images ?? [],
		total: result?.total ?? 0,
		page,
		pageSize: IMAGES_PAGE_SIZE,
	}
}

export {parsePage}

export async function getTownships(): Promise<TownshipOption[]> {
	const items = await sanityClient.fetch(TOWNSHIPS_QUERY)
	return sortTownshipsFirst(items ?? [])
}

export async function getLocations(): Promise<LocationOption[]> {
	return (await sanityClient.fetch(LOCATIONS_QUERY)) ?? []
}

export async function getSubjects(): Promise<SubjectOption[]> {
	const items = await sanityClient.fetch(SUBJECTS_QUERY)
	return sortSubjectsDemoteFuzzy(items ?? [])
}
