import type {FALLBACK_IMAGES_QUERY_RESULT} from '../../sanity.types'
import {
	CONCRETE_SUBJECTS,
	CORE_TOWNSHIPS,
	FUZZY_SUBJECTS,
	VALLEY_FORGE,
} from './limits'

export type CatalogImage = FALLBACK_IMAGES_QUERY_RESULT[number]
export type CatalogImageCard = Pick<
	CatalogImage,
	'_id' | 'title' | 'archiveId' | 'dateTaken' | 'township' | 'imageFile'
>

function lower(value: string | null | undefined): string {
	return (value ?? '').trim().toLowerCase()
}

export function isOutsideLocalArea(image: CatalogImage): boolean {
	return /^ola/i.test(image.archiveId ?? '')
}

export function isUntitled(image: CatalogImage): boolean {
	const title = lower(image.title)
	return !title || title.startsWith('untitled')
}

export function scoreCatalogImage(image: CatalogImage): number {
	if (!image.imageFile || isUntitled(image) || isOutsideLocalArea(image)) {
		return -1000
	}

	let score = 0
	const township = lower(image.township)
	const location = lower(image.location)
	if (CORE_TOWNSHIPS.includes(township as (typeof CORE_TOWNSHIPS)[number])) score += 40
	else if (township.includes(VALLEY_FORGE) || location.includes(VALLEY_FORGE)) score += 30
	else if (township) score += 10

	const year = image.dateTaken?.year
	if (year) {
		score += 25
		if (year >= 1900 && year <= 1930) score += 15
	}

	const subjects = (image.subjects ?? []).map(lower)
	if (subjects.some((subject) => CONCRETE_SUBJECTS.includes(subject as (typeof CONCRETE_SUBJECTS)[number]))) {
		score += 20
	}
	if (subjects.every((subject) => FUZZY_SUBJECTS.includes(subject as (typeof FUZZY_SUBJECTS)[number]))) {
		score -= 30
	}

	if (image.description?.trim()) score += 10
	return score
}

/**
 * Fill a highlight grid without letting one subject, decade, or series dominate.
 */
export function diversifyCatalogImages(
	candidates: CatalogImage[],
	limit: number,
	already: CatalogImage[] = [],
): CatalogImage[] {
	const chosen = [...already]
	const chosenIds = new Set(chosen.map((image) => image._id))
	const subjectCounts = new Map<string, number>()
	const decadeCounts = new Map<number, number>()

	const ranked = [...candidates]
		.filter((image) => !chosenIds.has(image._id) && scoreCatalogImage(image) > 0)
		.sort((a, b) => scoreCatalogImage(b) - scoreCatalogImage(a))

	for (const image of ranked) {
		if (chosen.length >= limit) break
		const primary = lower(image.subjects?.[0])
		const decade = image.dateTaken?.year
			? Math.floor(image.dateTaken.year / 10) * 10
			: undefined
		if (primary && (subjectCounts.get(primary) ?? 0) >= 4) continue
		if (decade != null && (decadeCounts.get(decade) ?? 0) >= 4) continue
		chosen.push(image)
		chosenIds.add(image._id)
		if (primary) subjectCounts.set(primary, (subjectCounts.get(primary) ?? 0) + 1)
		if (decade != null) decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1)
	}

	return chosen.slice(0, limit)
}

export function mergeFeaturedWithFallback(
	featured: CatalogImage[],
	fallback: CatalogImage[],
	limit: number,
): CatalogImage[] {
	const orderedFeatured = [...featured].sort((a, b) => {
		const rankA = a.featuredRank ?? 999
		const rankB = b.featuredRank ?? 999
		if (rankA !== rankB) return rankA - rankB
		return (a.title ?? '').localeCompare(b.title ?? '')
	})
	return diversifyCatalogImages(fallback, limit, orderedFeatured.slice(0, limit))
}
