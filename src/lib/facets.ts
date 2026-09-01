export interface FacetParams {
	q?: string
	township?: string
	location?: string
	subject?: string
	decade?: string
	page?: number
}

export interface FacetBuildOptions {
	type: string
	extraFilters?: string[]
	qFields: string[]
	yearField: 'dateTaken.year' | 'date.year'
	includeLocation?: boolean
	pageSize: number
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

	return {
		filter: filters.join(' && '),
		groqParams,
		page,
		start,
		end,
	}
}
