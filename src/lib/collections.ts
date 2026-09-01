import {sanityClient} from 'sanity:client'

import {ENTITY_IMAGE_STRIP} from './limits'

const PUBLIC_INCOMING = `count(*[_type in ["historicalImage", "primarySource", "quarterlyArticle", "researchArticle"] && references(^._id)])`

export async function getLatestQuarterlyIssue() {
	return sanityClient.fetch(/* groq */ `
		*[_type == "quarterlyIssue"] | order(volume desc, issueNumber desc)[0]{
			_id,
			volume,
			issueNumber,
			season,
			coverImage,
			"articles": *[_type == "quarterlyArticle" && issueRef._ref == ^._id] | order(startPage asc)[0...8]{
				_id, title, authorText, startPage
			}
		}
	`)
}

export async function getFeaturedResearch(limit = 3) {
	const featured = await sanityClient.fetch(/* groq */ `
		*[_type == "researchArticle" && featuredOnSite == true] | order(featuredRank asc, title asc)[0...${limit}]{
			_id, title, "slug": slug.current, featuredRank
		}
	`)
	if (featured?.length) return featured

	return sanityClient.fetch(/* groq */ `
		*[_type == "researchArticle" && defined(slug.current)] | order(title asc)[0...${limit}]{
			_id, title, "slug": slug.current
		}
	`)
}

export async function getResearchArticles(townshipId?: string) {
	const filters = ['_type == "researchArticle"', 'defined(slug.current)']
	const groqParams: Record<string, string> = {}
	if (townshipId?.trim()) {
		filters.push('$townshipId in townships[]._ref')
		groqParams.townshipId = townshipId.trim()
	}
	return sanityClient.fetch(
		`*[${filters.join(' && ')}] | order(title asc){_id, title, "slug": slug.current}`,
		groqParams,
	)
}

export async function getQuarterlyIssues() {
	return sanityClient.fetch(/* groq */ `
		*[_type == "quarterlyIssue"] | order(volume desc, issueNumber desc){
			_id, volume, issueNumber, season,
			"articleCount": count(*[_type == "quarterlyArticle" && issueRef._ref == ^._id])
		}
	`)
}

export async function getPlaces() {
	return sanityClient.fetch(/* groq */ `{
		"townships": *[_type == "township"] | order(name asc){_id, name},
		"locations": *[_type == "location"] | order(name asc){
			_id, name, "townships": townships[]->name
		}
	}`)
}

export async function getPlaceHub(id: string) {
	return sanityClient.fetch(
		/* groq */ `
			*[_type in ["township", "location"] && _id == $id][0]{
				_id, _type, name,
				"townships": townships[]->name,
				"imageCount": count(*[_type == "historicalImage" && (township._ref == ^._id || location._ref == ^._id)]),
				"images": *[_type == "historicalImage" && (township._ref == ^._id || location._ref == ^._id)] | order(dateTaken.year asc)[0...${ENTITY_IMAGE_STRIP}]{
					_id, title, archiveId, dateTaken, imageFile, "township": township->name
				},
				"documents": *[_type == "primarySource" && (township._ref == ^._id || references(^._id))] | order(title asc)[0...8]{
					_id, title, archiveId, newspaper, "year": date.year
				},
				"research": *[_type == "researchArticle" && $id in townships[]._ref] | order(title asc)[0...6]{
					_id, title, "slug": slug.current
				}
			}
		`,
		{id},
	)
}

export async function getLinkedPeople() {
	return sanityClient.fetch(/* groq */ `
		*[_type == "person" && ${PUBLIC_INCOMING} > 0] | order(lastName asc, firstName asc)[0...400]{
			_id, firstName, lastName,
			"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
			"linkCount": ${PUBLIC_INCOMING}
		}
	`)
}

export async function getPersonHub(id: string) {
	return sanityClient.fetch(
		/* groq */ `
			*[_type == "person" && _id == $id][0]{
				_id, firstName, lastName, "born": born.year, "died": died.year,
				"linkCount": ${PUBLIC_INCOMING},
				"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
				"images": *[_type == "historicalImage" && references(^._id)] | order(dateTaken.year asc)[0...${ENTITY_IMAGE_STRIP}]{
					_id, title, archiveId, dateTaken, imageFile, "township": township->name
				},
				"documents": *[_type == "primarySource" && references(^._id)] | order(title asc)[0...8]{
					_id, title, archiveId
				},
				"articles": *[_type in ["quarterlyArticle", "researchArticle"] && references(^._id)] | order(title asc)[0...8]{
					_id, _type, title, "slug": slug.current, sourceUrl
				}
			}
		`,
		{id},
	)
}

export async function getSubjectHubs() {
	return sanityClient.fetch(/* groq */ `
		*[_type == "category"] | order(title asc){
			_id, title, description,
			"imageCount": count(*[_type == "historicalImage" && references(^._id)])
		}
	`)
}

export async function getSubjectHub(id: string) {
	return sanityClient.fetch(
		/* groq */ `
			*[_type == "category" && _id == $id][0]{
				_id, title, description,
				"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
				"images": *[_type == "historicalImage" && references(^._id)] | order(dateTaken.year asc)[0...${ENTITY_IMAGE_STRIP}]{
					_id, title, archiveId, dateTaken, imageFile, "township": township->name
				},
				"documents": *[_type == "primarySource" && references(^._id)] | order(title asc)[0...8]{
					_id, title, archiveId, newspaper, "year": date.year
				},
				"quarterly": *[_type == "quarterlyArticle" && references(^._id)] | order(title asc)[0...8]{
					_id, title, sourceUrl, sourceKey
				}
			}
		`,
		{id},
	)
}

export async function getDocumentsPage(params: {
	q?: string
	township?: string
	subject?: string
	decade?: string
	page: number
	pageSize: number
}) {
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
	return sanityClient.fetch(
		`{
			"total": count(*[${filter}]),
			"documents": *[${filter}] | order(title asc)[${start}...${end}]{
				_id, title, archiveId, newspaper, "year": date.year,
				"excerpt": pt::text(transcription),
				articleImage
			}
		}`,
		groqParams,
	)
}

export async function getImageByArchiveId(archiveId: string) {
	return sanityClient.fetch(
		/* groq */ `
			*[_type == "historicalImage" && archiveId == $archiveId][0]{
				_id, title, archiveId, description, dateTaken, imageFile,
				"township": township->name,
				"location": location->{_id, name},
				"people": people[]->{_id, firstName, lastName},
				"subjects": subjects[]->{_id, title},
				rights
			}
		`,
		{archiveId},
	)
}

export async function getDocumentByArchiveId(archiveId: string) {
	return sanityClient.fetch(
		/* groq */ `
			*[_type == "primarySource" && archiveId == $archiveId][0]{
				_id, title, archiveId, newspaper, date, transcription, articleImage
			}
		`,
		{archiveId},
	)
}

export async function getResearchBySlug(slug: string) {
	return sanityClient.fetch(
		/* groq */ `
			*[_type == "researchArticle" && slug.current == $slug][0]{
				_id, title, body, notesAndReferences
			}
		`,
		{slug},
	)
}
