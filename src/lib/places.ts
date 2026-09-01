import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {PLACE_HUB_QUERY_RESULT, PLACES_QUERY_RESULT} from '../../sanity.types'
import {ENTITY_SLUG, ENTITY_SLUG_MATCH, PLACE_HUB_PROJECTION} from './groq'
import {hubStaticPaths} from './href'

export type PlacesIndex = PLACES_QUERY_RESULT
export type PlaceHub = NonNullable<PLACE_HUB_QUERY_RESULT>

export const PLACES_QUERY = defineQuery(/* groq */ `{
	"townships": *[_type == "township"] | order(name asc){_id, name, "slug": ${ENTITY_SLUG}},
	"locations": *[_type == "location"] | order(name asc){
		_id, name, "slug": ${ENTITY_SLUG}, "townships": townships[]->name
	}
}`)

export const PLACE_HUB_QUERY = defineQuery(/* groq */ `
	*[_type in ["township", "location"] && ${ENTITY_SLUG_MATCH}][0]{
		${PLACE_HUB_PROJECTION}
	}
`)

export const PLACE_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type in ["township", "location"]]{${PLACE_HUB_PROJECTION}}
`)

export async function getPlaces(): Promise<PlacesIndex> {
	return sanityClient.fetch(PLACES_QUERY)
}

export async function getPlaceHub(slug: string): Promise<PlaceHub | null> {
	return sanityClient.fetch(PLACE_HUB_QUERY, {slug})
}

export async function getPlaceHubPaths() {
	const rows = await sanityClient.fetch(PLACE_PATHS_QUERY)
	return hubStaticPaths(rows, '/places', (place) => ({place}))
}
