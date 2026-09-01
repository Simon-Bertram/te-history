export const PUBLIC_INCOMING = /* groq */ `
	count(*[_type in ["historicalImage", "primarySource", "quarterlyArticle", "researchArticle"] && references(^._id)])
`

export const IMAGE_PROJECTION = /* groq */ `
	_id,
	title,
	archiveId,
	description,
	dateTaken,
	featuredOnSite,
	featuredRank,
	imageFile,
	"township": township->name,
	"location": location->name,
	"subjects": subjects[]->title
`

export const ENTITY_IMAGE_PROJECTION = /* groq */ `
	_id, title, archiveId, dateTaken, imageFile, "township": township->name
`

export const DOCUMENT_LIST_PROJECTION = /* groq */ `
	_id, title, archiveId, newspaper, "year": date.year,
	"excerpt": pt::text(transcription),
	articleImage
`
