import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	SUBJECT_HUB_QUERY_RESULT,
	SUBJECT_HUBS_QUERY_RESULT,
} from '../../sanity.types'
import {SUBJECT_HUB_PROJECTION} from './groq'

export type SubjectHubListItem = SUBJECT_HUBS_QUERY_RESULT[number]
export type SubjectHub = NonNullable<SUBJECT_HUB_QUERY_RESULT>

export const SUBJECT_HUBS_QUERY = defineQuery(/* groq */ `
	*[_type == "category"] | order(title asc){
		_id, title, description,
		"imageCount": count(*[_type == "historicalImage" && references(^._id)])
	}
`)

export const SUBJECT_HUB_QUERY = defineQuery(/* groq */ `
	*[_type == "category" && _id == $id][0]{
		${SUBJECT_HUB_PROJECTION}
	}
`)

export const SUBJECT_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "category"]{${SUBJECT_HUB_PROJECTION}}
`)

export async function getSubjectHubs(): Promise<SubjectHubListItem[]> {
	return (await sanityClient.fetch(SUBJECT_HUBS_QUERY)) ?? []
}

export async function getSubjectHub(id: string): Promise<SubjectHub | null> {
	return sanityClient.fetch(SUBJECT_HUB_QUERY, {id})
}

export async function getSubjectHubPaths() {
	const rows = await sanityClient.fetch(SUBJECT_PATHS_QUERY)
	return (rows ?? []).map((row) => ({params: {id: row._id}, props: {subject: row}}))
}
