export function catalogPageCount(total: number, pageSize: number): number {
	if (total <= 0) return 0
	return Math.max(1, Math.ceil(total / pageSize))
}

export function formatCatalogResultsSummary(options: {
	total: number
	page: number
	pageSize: number
	singular: string
	plural: string
	pageInSummary: boolean
}): string {
	const {total, page, pageSize, singular, plural, pageInSummary} = options
	const label = total === 1 ? singular : plural
	const count = total.toLocaleString('en-US')
	const countLabel = `${count} ${label}`

	if (total === 0 || !pageInSummary) {
		return countLabel
	}

	const pageCount = catalogPageCount(total, pageSize)
	return `${countLabel} · Page ${page} of ${pageCount}`
}

export function formatDisplayingRangeSummary(options: {
	total: number
	page: number
	pageSize: number
	singular: string
	plural: string
}): string {
	const {total, page, pageSize, singular, plural} = options
	const label = total === 1 ? singular : plural

	if (total <= 0) {
		return `Displaying 0 ${plural}`
	}

	const start = (page - 1) * pageSize + 1
	const end = Math.min(page * pageSize, total)
	return `Displaying ${start.toLocaleString('en-US')}–${end.toLocaleString('en-US')} of ${total.toLocaleString('en-US')} ${label}`
}
