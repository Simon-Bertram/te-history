import {describe, expect, test} from 'bun:test'

import {catalogPageCount, formatCatalogResultsSummary} from './catalogResults'

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
