export const HOME_IMAGE_LIMIT = 8
export const IMAGES_PAGE_SIZE = 24
export const ENTITY_IMAGE_STRIP = 12
export const FALLBACK_POOL_SIZE = 80
export const SEARCH_RESULT_LIMIT = 12

export const FUZZY_SUBJECTS = [
	'person',
	'people',
	'place',
	'view',
	'cultural',
] as const

export const CONCRETE_SUBJECTS = [
	'house',
	'church',
	'school',
	'railroad',
	'inn',
	'farm',
	'mill',
] as const

export const CORE_TOWNSHIPS = ['tredyffrin', 'easttown'] as const

export const VALLEY_FORGE = 'valley forge'

export type ImageSort = 'date-desc' | 'date-asc' | 'title'

export function parseImageSort(value: string | undefined): ImageSort {
	if (value === 'date-asc' || value === 'title' || value === 'date-desc') return value
	return 'date-desc'
}

export function isFuzzySubject(title: string | null | undefined): boolean {
	return FUZZY_SUBJECTS.includes(
		(title ?? '').trim().toLowerCase() as (typeof FUZZY_SUBJECTS)[number],
	)
}

export function sortTownshipsFirst<T extends {name?: string | null}>(items: T[]): T[] {
	const rank = (name?: string | null) => {
		const lower = (name ?? '').trim().toLowerCase()
		const index = CORE_TOWNSHIPS.indexOf(lower as (typeof CORE_TOWNSHIPS)[number])
		return index === -1 ? 100 : index
	}
	return [...items].sort(
		(a, b) => rank(a.name) - rank(b.name) || (a.name ?? '').localeCompare(b.name ?? ''),
	)
}

export function sortSubjectsDemoteFuzzy<T extends {title?: string | null}>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const aFuzzy = isFuzzySubject(a.title) ? 1 : 0
		const bFuzzy = isFuzzySubject(b.title) ? 1 : 0
		return aFuzzy - bFuzzy || (a.title ?? '').localeCompare(b.title ?? '')
	})
}
