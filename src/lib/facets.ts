export const UNATTRIBUTED_PHOTOGRAPHER = 'unattributed'

export interface FacetParams {
	q?: string
	township?: string
	location?: string
	subject?: string
	decade?: string
	photographer?: string
	page?: number
}

export interface FacetBuildOptions {
	type: string
	extraFilters?: string[]
	qFields: string[]
	yearField: 'dateTaken.year' | 'date.year'
	includeLocation?: boolean
	includePhotographer?: boolean
	pageSize: number
}

/** Collapse case/spacing variants; prefer the most common casing, then A–Z. */
export function normalizePhotographerNames(raw: (string | null | undefined)[]): string[] {
	const groups = new Map<string, Map<string, number>>()

	for (const value of raw) {
		const trimmed = value?.trim()
		if (!trimmed) continue
		const key = trimmed.toLowerCase()
		const variants = groups.get(key) ?? new Map<string, number>()
		variants.set(trimmed, (variants.get(trimmed) ?? 0) + 1)
		groups.set(key, variants)
	}

	const labels: string[] = []
	for (const variants of groups.values()) {
		let best = ''
		let bestCount = -1
		for (const [label, count] of variants) {
			if (
				count > bestCount ||
				(count === bestCount &&
					label.localeCompare(best, 'en', {caseFirst: 'upper'}) < 0)
			) {
				best = label
				bestCount = count
			}
		}
		if (best) labels.push(best)
	}

	return labels.sort((a, b) => a.localeCompare(b, 'en', {sensitivity: 'base'}))
}

export function pageSlice(page: number, pageSize: number) {
	const start = (page - 1) * pageSize
	return {start, end: start + pageSize}
}

export function buildFacetQuery(params: FacetParams, options: FacetBuildOptions) {
	const page = params.page && params.page > 0 ? params.page : 1
	const {start, end} = pageSlice(page, options.pageSize)
	const filters = [`_type == "${options.type}"`, ...(options.extraFilters ?? [])]
	const groqParams: Record<string, string | number> = {}

	if (params.q?.trim()) {
		filters.push(`(${options.qFields.map((field) => `${field} match $q`).join(' || ')})`)
		groqParams.q = `*${params.q.trim()}*`
	}
	if (params.township?.trim()) {
		filters.push('township._ref == $townshipId')
		groqParams.townshipId = params.township.trim()
	}
	if (options.includeLocation && params.location?.trim()) {
		filters.push('location._ref == $locationId')
		groqParams.locationId = params.location.trim()
	}
	if (params.subject?.trim()) {
		filters.push('$subjectId in subjects[]._ref')
		groqParams.subjectId = params.subject.trim()
	}
	if (params.decade?.trim()) {
		const decade = Number(params.decade)
		if (Number.isInteger(decade)) {
			filters.push(
				`defined(${options.yearField}) && ${options.yearField} >= $decadeStart && ${options.yearField} < $decadeEnd`,
			)
			groqParams.decadeStart = decade
			groqParams.decadeEnd = decade + 10
		}
	}
	if (options.includePhotographer && params.photographer?.trim()) {
		const photographer = params.photographer.trim()
		if (photographer === UNATTRIBUTED_PHOTOGRAPHER) {
			filters.push('(!defined(photographer) || length(trim(photographer)) == 0)')
		} else {
			filters.push('defined(photographer) && lower(trim(photographer)) == $photographerKey')
			groqParams.photographerKey = photographer.toLowerCase()
		}
	}

	return {
		filter: filters.join(' && '),
		groqParams,
		page,
		start,
		end,
	}
}
