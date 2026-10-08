import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	IMAGE_BY_ARCHIVE_ID_QUERY_RESULT,
	LOCATIONS_QUERY_RESULT,
	SUBJECTS_QUERY_RESULT,
	TOWNSHIPS_QUERY_RESULT,
} from '../../sanity.types'
import {buildFacetQuery} from './facets'
import {IMAGE_DETAIL_PROJECTION, IMAGE_PROJECTION} from './groq'
import {archiveIdStaticPaths} from './href'
import type {CatalogImage} from './imageHighlights'
import {mergeFeaturedWithFallback} from './imageHighlights'
import {
	FALLBACK_POOL_SIZE,
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
export type ImageDetail = NonNullable<IMAGE_BY_ARCHIVE_ID_QUERY_RESULT>
export type {CatalogImage}

export const FEATURED_IMAGES_QUERY = defineQuery(/* groq */ `
	*[_type == "historicalImage" && featuredOnSite == true] | order(featuredRank asc, title asc)[0...$limit]{
		${IMAGE_PROJECTION}
	}
`)

export const FALLBACK_IMAGES_QUERY = defineQuery(/* groq */ `
	*[_type == "historicalImage" && defined(imageFile.asset) && defined(dateTaken.year) && defined(description) && defined(title) && !(title match "Untitled*") && !(archiveId match "OLA*")] | order(dateTaken.year asc)[0...${FALLBACK_POOL_SIZE}]{
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

export const IMAGE_BY_ARCHIVE_ID_QUERY = defineQuery(/* groq */ `
	*[_type == "historicalImage" && archiveId == $archiveId][0]{
		${IMAGE_DETAIL_PROJECTION}
	}
`)

export const IMAGE_STATIC_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "historicalImage" && defined(archiveId)]{${IMAGE_DETAIL_PROJECTION}}
`)

export const IMAGE_CATALOG_TOTAL_QUERY = defineQuery(/* groq */ `
	count(*[_type == "historicalImage" && defined(imageFile.asset)])
`)

const IMAGE_SORT_CLAUSE: Record<ImageSort, string> = {
	'date-desc': 'dateTaken.year desc, title asc',
	'date-asc': 'dateTaken.year asc, title asc',
	title: 'title asc',
}

export async function getHighlightImages(limit = HOME_IMAGE_LIMIT): Promise<CatalogImage[]> {
	const featured = (await sanityClient.fetch(FEATURED_IMAGES_QUERY, {limit})) ?? []
	if (featured.length >= limit) {
		return mergeFeaturedWithFallback(featured, [], limit)
	}
	const fallback = (await sanityClient.fetch(FALLBACK_IMAGES_QUERY)) ?? []
	return mergeFeaturedWithFallback(featured, fallback, limit)
}

export async function getImageCatalogTotal(): Promise<number> {
	return (await sanityClient.fetch(IMAGE_CATALOG_TOTAL_QUERY)) ?? 0
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

export async function getFilteredImages(params: ImageFacetParams): Promise<{
	images: CatalogImage[]
	total: number
	page: number
	pageSize: number
}> {
	const sort = parseImageSort(params.sort)
	const {filter, groqParams, page, start, end} = buildFacetQuery(params, {
		type: 'historicalImage',
		extraFilters: ['defined(imageFile.asset)'],
		qFields: ['title', 'archiveId', 'description'],
		yearField: 'dateTaken.year',
		includeLocation: true,
		pageSize: IMAGES_PAGE_SIZE,
	})
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

export async function getImageByArchiveId(archiveId: string): Promise<ImageDetail | null> {
	return sanityClient.fetch(IMAGE_BY_ARCHIVE_ID_QUERY, {archiveId})
}

export async function getImageStaticPaths() {
	const rows = await sanityClient.fetch(IMAGE_STATIC_PATHS_QUERY)
	return archiveIdStaticPaths(rows, (image) => ({image}))
}

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
