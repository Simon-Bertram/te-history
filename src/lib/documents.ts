import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	DOCUMENT_BY_ARCHIVE_ID_QUERY_RESULT,
	DOCUMENTS_PAGE_QUERY_RESULT,
} from '../../sanity.types'
import {buildFacetQuery} from './facets'
import {DOCUMENT_DETAIL_PROJECTION, DOCUMENT_LIST_PROJECTION} from './groq'
import {archiveIdStaticPaths} from './href'
import {DOCUMENTS_PAGE_SIZE} from './limits'

export type DocumentsPage = DOCUMENTS_PAGE_QUERY_RESULT
export type DocumentListItem = DocumentsPage['documents'][number]
export type DocumentDetail = NonNullable<DOCUMENT_BY_ARCHIVE_ID_QUERY_RESULT>

export const DOCUMENTS_PAGE_QUERY = defineQuery(/* groq */ `{
	"total": count(*[_type == "primarySource"]),
	"documents": *[_type == "primarySource"] | order(title asc)[0...${DOCUMENTS_PAGE_SIZE}]{
		${DOCUMENT_LIST_PROJECTION}
	}
}`)

export const DOCUMENT_BY_ARCHIVE_ID_QUERY = defineQuery(/* groq */ `
	*[_type == "primarySource" && archiveId == $archiveId][0]{
		${DOCUMENT_DETAIL_PROJECTION}
	}
`)

export const DOCUMENT_STATIC_PATHS_QUERY = defineQuery(/* groq */ `
	*[_type == "primarySource" && defined(archiveId)]{${DOCUMENT_DETAIL_PROJECTION}}
`)

export async function getDocumentsPage(params: {
	q?: string
	township?: string
	subject?: string
	decade?: string
	page: number
}): Promise<DocumentsPage> {
	const {filter, groqParams, start, end} = buildFacetQuery(params, {
		type: 'primarySource',
		qFields: ['title', 'archiveId'],
		yearField: 'date.year',
		pageSize: DOCUMENTS_PAGE_SIZE,
	})
	// @sanity-typegen-ignore — facet filters and page slices are interpolated
	const query = /* groq */ `{
		"total": count(*[${filter}]),
		"documents": *[${filter}] | order(title asc)[${start}...${end}]{
			${DOCUMENT_LIST_PROJECTION}
		}
	}`
	return sanityClient.fetch(query, groqParams) as Promise<DocumentsPage>
}

export async function getDocumentByArchiveId(
	archiveId: string,
): Promise<DocumentDetail | null> {
	return sanityClient.fetch(DOCUMENT_BY_ARCHIVE_ID_QUERY, {archiveId})
}

export async function getDocumentStaticPaths() {
	const rows = await sanityClient.fetch(DOCUMENT_STATIC_PATHS_QUERY)
	return archiveIdStaticPaths(rows, (document) => ({document}))
}
