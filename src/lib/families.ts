import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	FAMILIES_INDEX_QUERY_RESULT,
	FAMILY_HUB_QUERY_RESULT,
} from '../../sanity.types'
import {ENTITY_SLUG_MATCH, FAMILY_HUB_PROJECTION, FAMILY_LIST_PROJECTION} from './groq'
import {hubStaticPaths} from './href'

export type FamilyListItem = FAMILIES_INDEX_QUERY_RESULT[number]
export type FamilyHub = NonNullable<FAMILY_HUB_QUERY_RESULT>

const FAMILY_FILTER = '_type == "familyLine" && defined(title) && title != ""'

export const FAMILIES_INDEX_QUERY = defineQuery(/* groq */ `
	*[${FAMILY_FILTER}] | order(title asc){
		${FAMILY_LIST_PROJECTION}
	}
`)

export const FAMILY_HUB_QUERY = defineQuery(/* groq */ `
	*[_type == "familyLine" && ${ENTITY_SLUG_MATCH}][0]{
		${FAMILY_HUB_PROJECTION}
	}
`)

export const FAMILY_HUB_PATHS_QUERY = defineQuery(/* groq */ `
	*[${FAMILY_FILTER}]{
		${FAMILY_HUB_PROJECTION}
	}
`)

export async function getFamilies(): Promise<FamilyListItem[]> {
	return (await sanityClient.fetch(FAMILIES_INDEX_QUERY)) ?? []
}

export async function getFamilyHub(slug: string): Promise<FamilyHub | null> {
	return sanityClient.fetch(FAMILY_HUB_QUERY, {slug})
}

export async function getFamilyHubPaths() {
	const rows = await sanityClient.fetch(FAMILY_HUB_PATHS_QUERY)
	return hubStaticPaths(rows, '/families', (family) => ({family}))
}
