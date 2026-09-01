import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {PLACE_HUB_QUERY_RESULT, PLACES_QUERY_RESULT} from '../../sanity.types'
import {PLACE_HUB_PROJECTION} from './groq'

export type PlacesIndex = PLACES_QUERY_RESULT
export type PlaceHub = NonNullable<PLACE_HUB_QUERY_RESULT>

export const PLACES_QUERY = defineQuery(/* groq */ `{
	"townships": *[_type == "township"] | order(name asc){_id, name},
	"locations": *[_type == "location"] | order(name asc){
		_id, name, "townships": townships[]->name
	}
}`)

export const PLACE_HUB_QUERY = defineQuery(/* groq */ `
	*[_type in ["township", "location"] && _id == $id][0]{
		${PLACE_HUB_PROJECTION}
	}
`)

export const PLACE_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type in ["township", "location"]]{${PLACE_HUB_PROJECTION}}
`)

export async function getPlaces(): Promise<PlacesIndex> {
	return sanityClient.fetch(PLACES_QUERY)
}

export async function getPlaceHub(id: string): Promise<PlaceHub | null> {
	return sanityClient.fetch(PLACE_HUB_QUERY, {id})
}

export async function getPlaceHubPaths() {
	const rows = await sanityClient.fetch(PLACE_PATHS_QUERY)
	return (rows ?? []).map((row) => ({params: {id: row._id}, props: {place: row}}))
}
