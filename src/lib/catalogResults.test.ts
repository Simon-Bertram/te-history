import {describe, expect, test} from 'bun:test'

import {
	catalogPageCount,
	formatCatalogResultsSummary,
	formatDisplayingRangeSummary,
} from './catalogResults'

describe('catalogPageCount', () => {
	test('returns 0 for empty totals', () => {
		expect(catalogPageCount(0, 24)).toBe(0)
		expect(catalogPageCount(-1, 24)).toBe(0)
	})

	test('ceil-divides positive totals', () => {
		expect(catalogPageCount(1, 24)).toBe(1)
		expect(catalogPageCount(24, 24)).toBe(1)
		expect(catalogPageCount(25, 24)).toBe(2)
		expect(catalogPageCount(888, 24)).toBe(37)
	})
})

describe('formatCatalogResultsSummary', () => {
	test('formats zero without a page segment', () => {
		expect(
			formatCatalogResultsSummary({
				total: 0,
				page: 1,
				pageSize: 24,
				singular: 'document',
				plural: 'documents',
				pageInSummary: true,
			}),
		).toBe('0 documents')
	})

	test('uses singular for one result', () => {
		expect(
			formatCatalogResultsSummary({
				total: 1,
				page: 1,
				pageSize: 24,
				singular: 'photograph',
				plural: 'photographs',
				pageInSummary: false,
			}),
		).toBe('1 photograph')
	})

	test('localizes large counts', () => {
		expect(
			formatCatalogResultsSummary({
				total: 1234,
				page: 1,
				pageSize: 24,
				singular: 'document',
				plural: 'documents',
				pageInSummary: false,
			}),
		).toBe('1,234 documents')
	})

	test('appends page segment when requested', () => {
		expect(
			formatCatalogResultsSummary({
				total: 888,
				page: 1,
				pageSize: 24,
				singular: 'document',
				plural: 'documents',
				pageInSummary: true,
			}),
		).toBe('888 documents · Page 1 of 37')
	})

	test('includes Page 1 of 1 when pageInSummary is true for one page', () => {
		expect(
			formatCatalogResultsSummary({
				total: 12,
				page: 1,
				pageSize: 24,
				singular: 'photograph',
				plural: 'photographs',
				pageInSummary: true,
			}),
		).toBe('12 photographs · Page 1 of 1')
	})
})

describe('formatDisplayingRangeSummary', () => {
	test('formats zero results', () => {
		expect(
			formatDisplayingRangeSummary({
				total: 0,
				page: 1,
				pageSize: 24,
				singular: 'photograph',
				plural: 'photographs',
			}),
		).toBe('Displaying 0 photographs')
	})

	test('formats a short first page', () => {
		expect(
			formatDisplayingRangeSummary({
				total: 12,
				page: 1,
				pageSize: 24,
				singular: 'photograph',
				plural: 'photographs',
			}),
		).toBe('Displaying 1–12 of 12 photographs')
	})

	test('formats a full first page', () => {
		expect(
			formatDisplayingRangeSummary({
				total: 7054,
				page: 1,
				pageSize: 24,
				singular: 'photograph',
				plural: 'photographs',
			}),
		).toBe('Displaying 1–24 of 7,054 photographs')
	})

	test('formats a middle page', () => {
		expect(
			formatDisplayingRangeSummary({
				total: 888,
				page: 2,
				pageSize: 24,
				singular: 'document',
				plural: 'documents',
			}),
		).toBe('Displaying 25–48 of 888 documents')
	})

	test('clamps the last page end to total', () => {
		expect(
			formatDisplayingRangeSummary({
				total: 50,
				page: 3,
				pageSize: 24,
				singular: 'photograph',
				plural: 'photographs',
			}),
		).toBe('Displaying 49–50 of 50 photographs')
	})

	test('uses singular when total is one', () => {
		expect(
			formatDisplayingRangeSummary({
				total: 1,
				page: 1,
				pageSize: 24,
				singular: 'photograph',
				plural: 'photographs',
			}),
		).toBe('Displaying 1–1 of 1 photograph')
	})
})
