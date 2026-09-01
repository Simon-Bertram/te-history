import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	LINKED_PEOPLE_QUERY_RESULT,
	PERSON_HUB_QUERY_RESULT,
} from '../../sanity.types'
import {HAS_PUBLIC_INCOMING, PERSON_HUB_PROJECTION} from './groq'

export type LinkedPerson = LINKED_PEOPLE_QUERY_RESULT[number]
export type PersonHub = NonNullable<PERSON_HUB_QUERY_RESULT>

export const LINKED_PEOPLE_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && ${HAS_PUBLIC_INCOMING}] | order(lastName asc, firstName asc){
		_id, firstName, lastName,
		"imageCount": count(*[_type == "historicalImage" && references(^._id)])
	}
`)

export const PERSON_HUB_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && _id == $id][0]{
		${PERSON_HUB_PROJECTION}
	}
`)

export const LINKED_PEOPLE_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && ${HAS_PUBLIC_INCOMING}]{${PERSON_HUB_PROJECTION}}
`)

export async function getLinkedPeople(): Promise<LinkedPerson[]> {
	return (await sanityClient.fetch(LINKED_PEOPLE_QUERY)) ?? []
}

export async function getPersonHub(id: string): Promise<PersonHub | null> {
	return sanityClient.fetch(PERSON_HUB_QUERY, {id})
}

export async function getPersonHubPaths() {
	const rows = await sanityClient.fetch(LINKED_PEOPLE_PATHS_QUERY)
	return (rows ?? []).map((row) => ({params: {id: row._id}, props: {person: row}}))
}
