import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	LINKED_PEOPLE_QUERY_RESULT,
	PERSON_HUB_QUERY_RESULT,
} from '../../sanity.types'
import {ENTITY_SLUG, ENTITY_SLUG_MATCH, HAS_PUBLIC_INCOMING, PERSON_HUB_PROJECTION} from './groq'
import {hubStaticPaths} from './href'

export type LinkedPerson = LINKED_PEOPLE_QUERY_RESULT[number]
export type PersonHub = NonNullable<PERSON_HUB_QUERY_RESULT>

export const LINKED_PEOPLE_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && ${HAS_PUBLIC_INCOMING}] | order(lastName asc, firstName asc){
		_id, firstName, lastName, "slug": ${ENTITY_SLUG},
		"imageCount": count(*[_type == "historicalImage" && references(^._id)])
	}
`)

export const PERSON_HUB_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && ${ENTITY_SLUG_MATCH}][0]{
		${PERSON_HUB_PROJECTION}
	}
`)

export const LINKED_PEOPLE_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && ${HAS_PUBLIC_INCOMING}]{${PERSON_HUB_PROJECTION}}
`)

export async function getLinkedPeople(): Promise<LinkedPerson[]> {
	return (await sanityClient.fetch(LINKED_PEOPLE_QUERY)) ?? []
}

export async function getPersonHub(slug: string): Promise<PersonHub | null> {
	return sanityClient.fetch(PERSON_HUB_QUERY, {slug})
}

export async function getPersonHubPaths() {
	const rows = await sanityClient.fetch(LINKED_PEOPLE_PATHS_QUERY)
	return hubStaticPaths(rows, '/people', (person) => ({person}))
}
