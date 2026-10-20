import {
	ENTITY_IMAGE_STRIP,
	HUB_ARTICLE_LIMIT,
	HUB_DOCUMENT_LIMIT,
	HUB_RESEARCH_LIMIT,
} from './limits'

/** True when at least one public catalog document references the parent. */
export const HAS_PUBLIC_INCOMING = /* groq */ `
	defined(*[_type in ["historicalImage", "primarySource", "quarterlyArticle", "researchArticle"] && references(^._id)][0]._id)
`

export const IMAGE_PROJECTION = /* groq */ `
	_id,
	title,
	archiveId,
	description,
	dateTaken,
	featuredOnSite,
	featuredRank,
	imageFile {
		...,
		alt
	},
	"township": township->name,
	"location": location->name,
	"subjects": subjects[]->title
`

export const ENTITY_IMAGE_PROJECTION = /* groq */ `
	_id, title, archiveId, dateTaken,
	imageFile {
		...,
		alt
	},
	"township": township->name
`

export const HUB_DOCUMENT_PROJECTION = /* groq */ `
	_id, title, archiveId
`

export const DOCUMENT_LIST_PROJECTION = /* groq */ `
	_id, title, archiveId, newspaper, "year": date.year,
	"excerpt": pt::text(transcription),
	articleImage
`

export const IMAGE_ASSET_DIMENSIONS = /* groq */ `
	asset->{
		_id,
		metadata { dimensions { width, height } }
	}
`

/** `slug.current` when Studio has one; otherwise `_id` so old URLs keep working. */
export const ENTITY_SLUG = /* groq */ `coalesce(slug.current, _id)`

export const ENTITY_SLUG_MATCH = /* groq */ `(_id == $slug || slug.current == $slug)`

export const PORTABLE_TEXT_WITH_EMBEDS = /* groq */ `
	[]{
		...,
		_type == "historicalImageEmbed" => {
			...,
			historicalImage->{
				_id,
				title,
				archiveId,
				imageFile {
					...,
					alt,
					${IMAGE_ASSET_DIMENSIONS}
				}
			}
		}
	}
`

export const IMAGE_DETAIL_PROJECTION = /* groq */ `
	_id, title, archiveId, description, dateTaken,
	imageFile {
		...,
		alt,
		${IMAGE_ASSET_DIMENSIONS}
	},
	"township": township->name,
	"location": location->{_id, name, "slug": ${ENTITY_SLUG}},
	"people": people[]->{_id, firstName, lastName, "slug": ${ENTITY_SLUG}},
	"subjects": subjects[]->{_id, title, "slug": ${ENTITY_SLUG}},
	photographer,
	contributor,
	rights,
	references
`

export const DOCUMENT_DETAIL_PROJECTION = /* groq */ `
	_id, title, archiveId, newspaper, date,
	"transcription": transcription${PORTABLE_TEXT_WITH_EMBEDS},
	articleImage {
		...,
		${IMAGE_ASSET_DIMENSIONS}
	}
`

export const PERSON_HUB_PROJECTION = /* groq */ `
	_id, firstName, lastName, "slug": ${ENTITY_SLUG},
	"born": born.year, "died": died.year,
	"hasPublicLink": ${HAS_PUBLIC_INCOMING},
	"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
	"images": *[_type == "historicalImage" && references(^._id)] | order(dateTaken.year asc)[0...${ENTITY_IMAGE_STRIP}]{
		${ENTITY_IMAGE_PROJECTION}
	},
	"documents": *[_type == "primarySource" && references(^._id)] | order(title asc)[0...${HUB_DOCUMENT_LIMIT}]{
		${HUB_DOCUMENT_PROJECTION}
	},
	"articles": *[_type in ["quarterlyArticle", "researchArticle"] && references(^._id)] | order(title asc)[0...${HUB_ARTICLE_LIMIT}]{
		_id, _type, title, "slug": slug.current, sourceUrl
	}
`

export const PLACE_HUB_PROJECTION = /* groq */ `
	_id, _type, name, "slug": ${ENTITY_SLUG},
	"townships": townships[]->name,
	"imageCount": count(*[_type == "historicalImage" && (township._ref == ^._id || location._ref == ^._id)]),
	"images": *[_type == "historicalImage" && (township._ref == ^._id || location._ref == ^._id)] | order(dateTaken.year asc)[0...${ENTITY_IMAGE_STRIP}]{
		${ENTITY_IMAGE_PROJECTION}
	},
	"documents": *[_type == "primarySource" && (township._ref == ^._id || references(^._id))] | order(title asc)[0...${HUB_DOCUMENT_LIMIT}]{
		${HUB_DOCUMENT_PROJECTION}
	},
	"research": *[_type == "researchArticle" && ^._id in townships[]._ref] | order(title asc)[0...${HUB_RESEARCH_LIMIT}]{
		_id, title, "slug": slug.current
	}
`

export const SUBJECT_HUB_PROJECTION = /* groq */ `
	_id, title, description, "slug": ${ENTITY_SLUG},
	"imageCount": count(*[_type == "historicalImage" && references(^._id)]),
	"images": *[_type == "historicalImage" && references(^._id)] | order(dateTaken.year asc)[0...${ENTITY_IMAGE_STRIP}]{
		${ENTITY_IMAGE_PROJECTION}
	},
	"documents": *[_type == "primarySource" && references(^._id)] | order(title asc)[0...${HUB_DOCUMENT_LIMIT}]{
		${HUB_DOCUMENT_PROJECTION}
	},
	"quarterly": *[_type == "quarterlyArticle" && references(^._id)] | order(title asc)[0...${HUB_ARTICLE_LIMIT}]{
		_id, title, sourceUrl
	}
`
