import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {
	DOCUMENT_BY_ARCHIVE_ID_QUERY_RESULT,
	DOCUMENTS_PAGE_QUERY_RESULT,
	FEATURED_RESEARCH_FALLBACK_QUERY_RESULT,
	IMAGE_BY_ARCHIVE_ID_QUERY_RESULT,
	LATEST_QUARTERLY_ISSUE_QUERY_RESULT,
	LINKED_PEOPLE_QUERY_RESULT,
	PERSON_HUB_QUERY_RESULT,
	PLACE_HUB_QUERY_RESULT,
	PLACES_QUERY_RESULT,
	QUARTERLY_ISSUES_QUERY_RESULT,
	RESEARCH_ARTICLES_QUERY_RESULT,
	RESEARCH_BY_SLUG_QUERY_RESULT,
	SUBJECT_HUB_QUERY_RESULT,
	SUBJECT_HUBS_QUERY_RESULT,
} from '../../sanity.types'
import {
	DOCUMENT_LIST_PROJECTION,
	ENTITY_IMAGE_PROJECTION,
	PUBLIC_INCOMING,
} from './groq'

export type LatestQuarterlyIssue = NonNullable<LATEST_QUARTERLY_ISSUE_QUERY_RESULT>
export type QuarterlyIssueArticle = LatestQuarterlyIssue['articles'][number]
export type FeaturedResearchArticle = FEATURED_RESEARCH_FALLBACK_QUERY_RESULT[number]
export type ResearchListItem = RESEARCH_ARTICLES_QUERY_RESULT[number]
export type QuarterlyIssueListItem = QUARTERLY_ISSUES_QUERY_RESULT[number]
export type PlacesIndex = PLACES_QUERY_RESULT
export type PlaceHub = NonNullable<PLACE_HUB_QUERY_RESULT>
export type LinkedPerson = LINKED_PEOPLE_QUERY_RESULT[number]
export type PersonHub = NonNullable<PERSON_HUB_QUERY_RESULT>
export type SubjectHubListItem = SUBJECT_HUBS_QUERY_RESULT[number]
export type SubjectHub = NonNullable<SUBJECT_HUB_QUERY_RESULT>
export type DocumentsPage = DOCUMENTS_PAGE_QUERY_RESULT
export type DocumentListItem = DocumentsPage['documents'][number]
export type ImageDetail = NonNullable<IMAGE_BY_ARCHIVE_ID_QUERY_RESULT>
export type DocumentDetail = NonNullable<DOCUMENT_BY_ARCHIVE_ID_QUERY_RESULT>
export type ResearchArticleDetail = NonNullable<RESEARCH_BY_SLUG_QUERY_RESULT>

export const LATEST_QUARTERLY_ISSUE_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyIssue" && count(*[_type == "quarterlyArticle" && issueRef._ref == ^._id]) > 0] | order(volume desc, issueNumber desc)[0]{
		_id,
		volume,
		issueNumber,
		season,
		coverImage,
		"articles": *[_type == "quarterlyArticle" && issueRef._ref == ^._id] | order(startPage asc)[0...8]{
			_id, title, authorText, startPage, sourceUrl
		}
	}
`)

export const FEATURED_RESEARCH_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && featuredOnSite == true] | order(featuredRank asc, title asc)[0...3]{
		_id, title, "slug": slug.current, featuredRank
	}
`)

export const FEATURED_RESEARCH_FALLBACK_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && defined(slug.current)] | order(title asc)[0...3]{
		_id, title, "slug": slug.current
	}
`)

export const RESEARCH_ARTICLES_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && defined(slug.current)] | order(title asc){
		_id, title, "slug": slug.current
	}
`)

export const QUARTERLY_ISSUES_QUERY = defineQuery(/* groq */ `
	*[_type == "quarterlyIssue"] | order(volume desc, issueNumber desc){
		_id, volume, issueNumber, season,
		"articles": *[_type == "quarterlyArticle" && issueRef._ref == ^._id] | order(startPage asc){
			_id, title, authorText, startPage, sourceUrl
		}
	}
`)

export const PLACES_QUERY = defineQuery(/* groq */ `{
	"townships": *[_type == "township"] | order(name asc){_id, name},
	"locations": *[_type == "location"] | order(name asc){
		_id, name, "townships": townships[]->name
	}
}`)

export const PLACE_HUB_QUERY = defineQuery(/* groq */ `
	*[_type in ["township", "location"] && _id == $id][0]{
		_id, _type, name,
		"townships": townships[]->name,
		"imageCount": count(*[_type == "historicalImage" && (township._ref == ^._id || location._ref == ^._id)]),
		"images": *[_type == "historicalImage" && (township._ref == ^._id || location._ref == ^._id)] | order(dateTaken.year asc)[0...12]{
			${ENTITY_IMAGE_PROJECTION}
		},
		"documents": *[_type == "primarySource" && (township._ref == ^._id || references(^._id))] | order(title asc)[0...8]{
			_id, title, archiveId, newspaper, "year": date.year
		},
		"research": *[_type == "researchArticle" && $id in townships[]._ref] | order(title asc)[0...6]{
			_id, title, "slug": slug.current
		}
	}
`)

export const LINKED_PEOPLE_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && ${PUBLIC_INCOMING} > 0] | order(lastName asc, firstName asc)[0...400]{
		_id, firstName, lastName,
		"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
		"linkCount": ${PUBLIC_INCOMING}
	}
`)

export const PERSON_HUB_QUERY = defineQuery(/* groq */ `
	*[_type == "person" && _id == $id][0]{
		_id, firstName, lastName, "born": born.year, "died": died.year,
		"linkCount": ${PUBLIC_INCOMING},
		"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
		"images": *[_type == "historicalImage" && references(^._id)] | order(dateTaken.year asc)[0...12]{
			${ENTITY_IMAGE_PROJECTION}
		},
		"documents": *[_type == "primarySource" && references(^._id)] | order(title asc)[0...8]{
			_id, title, archiveId
		},
		"articles": *[_type in ["quarterlyArticle", "researchArticle"] && references(^._id)] | order(title asc)[0...8]{
			_id, _type, title, "slug": slug.current, sourceUrl
		}
	}
`)

export const SUBJECT_HUBS_QUERY = defineQuery(/* groq */ `
	*[_type == "category"] | order(title asc){
		_id, title, description,
		"imageCount": count(*[_type == "historicalImage" && references(^._id)])
	}
`)

export const SUBJECT_HUB_QUERY = defineQuery(/* groq */ `
	*[_type == "category" && _id == $id][0]{
		_id, title, description,
		"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
		"images": *[_type == "historicalImage" && references(^._id)] | order(dateTaken.year asc)[0...12]{
			${ENTITY_IMAGE_PROJECTION}
		},
		"documents": *[_type == "primarySource" && references(^._id)] | order(title asc)[0...8]{
			_id, title, archiveId, newspaper, "year": date.year
		},
		"quarterly": *[_type == "quarterlyArticle" && references(^._id)] | order(title asc)[0...8]{
			_id, title, sourceUrl, sourceKey
		}
	}
`)

export const DOCUMENTS_PAGE_QUERY = defineQuery(/* groq */ `{
	"total": count(*[_type == "primarySource"]),
	"documents": *[_type == "primarySource"] | order(title asc)[0...24]{
		${DOCUMENT_LIST_PROJECTION}
	}
}`)

export const IMAGE_BY_ARCHIVE_ID_QUERY = defineQuery(/* groq */ `
	*[_type == "historicalImage" && archiveId == $archiveId][0]{
		_id, title, archiveId, description, dateTaken, imageFile,
		"township": township->name,
		"location": location->{_id, name},
		"people": people[]->{_id, firstName, lastName},
		"subjects": subjects[]->{_id, title},
		rights
	}
`)

export const DOCUMENT_BY_ARCHIVE_ID_QUERY = defineQuery(/* groq */ `
	*[_type == "primarySource" && archiveId == $archiveId][0]{
		_id, title, archiveId, newspaper, date, transcription, articleImage
	}
`)

export const RESEARCH_BY_SLUG_QUERY = defineQuery(/* groq */ `
	*[_type == "researchArticle" && slug.current == $slug][0]{
		_id, title, body, notesAndReferences
	}
`)

export async function getLatestQuarterlyIssue(): Promise<LatestQuarterlyIssue | null> {
	return sanityClient.fetch(LATEST_QUARTERLY_ISSUE_QUERY)
}

export async function getFeaturedResearch(): Promise<FeaturedResearchArticle[]> {
	const featured = await sanityClient.fetch(FEATURED_RESEARCH_QUERY)
	if (featured?.length) return featured
	return (await sanityClient.fetch(FEATURED_RESEARCH_FALLBACK_QUERY)) ?? []
}

export async function getResearchArticles(townshipId?: string): Promise<ResearchListItem[]> {
	if (!townshipId?.trim()) {
		return (await sanityClient.fetch(RESEARCH_ARTICLES_QUERY)) ?? []
	}
	const groqParams = {townshipId: townshipId.trim()}
	// @sanity-typegen-ignore — township filter is interpolated at runtime
	const query = /* groq */ `*[_type == "researchArticle" && defined(slug.current) && $townshipId in townships[]._ref] | order(title asc){_id, title, "slug": slug.current}`
	return (await sanityClient.fetch(query, groqParams)) ?? []
}

export async function getQuarterlyIssues(): Promise<QuarterlyIssueListItem[]> {
	return (await sanityClient.fetch(QUARTERLY_ISSUES_QUERY)) ?? []
}

export async function getPlaces(): Promise<PlacesIndex> {
	return sanityClient.fetch(PLACES_QUERY)
}

export async function getPlaceHub(id: string): Promise<PlaceHub | null> {
	return sanityClient.fetch(PLACE_HUB_QUERY, {id})
}

export async function getLinkedPeople(): Promise<LinkedPerson[]> {
	return (await sanityClient.fetch(LINKED_PEOPLE_QUERY)) ?? []
}

export async function getPersonHub(id: string): Promise<PersonHub | null> {
	return sanityClient.fetch(PERSON_HUB_QUERY, {id})
}

export async function getSubjectHubs(): Promise<SubjectHubListItem[]> {
	return (await sanityClient.fetch(SUBJECT_HUBS_QUERY)) ?? []
}

export async function getSubjectHub(id: string): Promise<SubjectHub | null> {
	return sanityClient.fetch(SUBJECT_HUB_QUERY, {id})
}

export async function getDocumentsPage(params: {
	q?: string
	township?: string
	subject?: string
	decade?: string
	page: number
	pageSize: number
}): Promise<DocumentsPage> {
	const start = (params.page - 1) * params.pageSize
	const end = start + params.pageSize
	const filters = ['_type == "primarySource"']
	const groqParams: Record<string, string | number> = {}

	if (params.q?.trim()) {
		filters.push('(title match $q || archiveId match $q)')
		groqParams.q = `*${params.q.trim()}*`
	}
	if (params.township?.trim()) {
		filters.push('township._ref == $townshipId')
		groqParams.townshipId = params.township.trim()
	}
	if (params.subject?.trim()) {
		filters.push('$subjectId in subjects[]._ref')
		groqParams.subjectId = params.subject.trim()
	}
	if (params.decade?.trim()) {
		const decade = Number(params.decade)
		if (Number.isInteger(decade)) {
			filters.push(
				'defined(date.year) && date.year >= $decadeStart && date.year < $decadeEnd',
			)
			groqParams.decadeStart = decade
			groqParams.decadeEnd = decade + 10
		}
	}

	const filter = filters.join(' && ')
	// @sanity-typegen-ignore — facet filters and page slices are interpolated
	const query = /* groq */ `{
		"total": count(*[${filter}]),
		"documents": *[${filter}] | order(title asc)[${start}...${end}]{
			${DOCUMENT_LIST_PROJECTION}
		}
	}`
	return sanityClient.fetch(query, groqParams) as Promise<DocumentsPage>
}

export async function getImageByArchiveId(archiveId: string): Promise<ImageDetail | null> {
	return sanityClient.fetch(IMAGE_BY_ARCHIVE_ID_QUERY, {archiveId})
}

export async function getDocumentByArchiveId(
	archiveId: string,
): Promise<DocumentDetail | null> {
	return sanityClient.fetch(DOCUMENT_BY_ARCHIVE_ID_QUERY, {archiveId})
}

export async function getResearchBySlug(
	slug: string,
): Promise<ResearchArticleDetail | null> {
	return sanityClient.fetch(RESEARCH_BY_SLUG_QUERY, {slug})
}
