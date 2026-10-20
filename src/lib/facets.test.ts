import {describe, expect, test} from 'bun:test'

import {
	UNATTRIBUTED_PHOTOGRAPHER,
	buildFacetQuery,
	normalizePhotographerNames,
	pageSlice,
} from './facets'

describe('pageSlice', () => {
	test('uses exclusive GROQ end indexes', () => {
		expect(pageSlice(1, 24)).toEqual({start: 0, end: 24})
		expect(pageSlice(2, 24)).toEqual({start: 24, end: 48})
	})
})

describe('normalizePhotographerNames', () => {
	test('dedupes case-insensitively and prefers the most common casing', () => {
		expect(
			normalizePhotographerNames([
				'john doe',
				'John Doe',
				'John Doe',
				'  Jane Smith  ',
				'jane smith',
				'',
				null,
				undefined,
			]),
		).toEqual(['Jane Smith', 'John Doe'])
	})

	test('breaks casing ties alphabetically', () => {
		expect(normalizePhotographerNames(['alpha', 'Alpha'])).toEqual(['Alpha'])
	})
})

describe('buildFacetQuery', () => {
	test('shares township, subject, and decade clauses', () => {
		const images = buildFacetQuery(
			{q: 'paoli', township: 'tw-1', location: 'loc-1', subject: 'cat-1', decade: '1910', page: 2},
			{
				type: 'historicalImage',
				extraFilters: ['defined(imageFile.asset)'],
				qFields: ['title', 'archiveId', 'description'],
				yearField: 'dateTaken.year',
				includeLocation: true,
				pageSize: 24,
			},
		)
		expect(images.page).toBe(2)
		expect(images.start).toBe(24)
		expect(images.filter).toContain('_type == "historicalImage"')
		expect(images.filter).toContain('defined(imageFile.asset)')
		expect(images.filter).toContain('title match $q')
		expect(images.filter).toContain('description match $q')
		expect(images.filter).toContain('township._ref == $townshipId')
		expect(images.filter).toContain('location._ref == $locationId')
		expect(images.filter).toContain('$subjectId in subjects[]._ref')
		expect(images.filter).toContain('dateTaken.year >= $decadeStart')
		expect(images.groqParams).toEqual({
			q: '*paoli*',
			townshipId: 'tw-1',
			locationId: 'loc-1',
			subjectId: 'cat-1',
			decadeStart: 1910,
			decadeEnd: 1920,
		})

		const documents = buildFacetQuery(
			{township: 'tw-1', decade: '1910'},
			{
				type: 'primarySource',
				qFields: ['title', 'archiveId'],
				yearField: 'date.year',
				pageSize: 24,
			},
		)
		expect(documents.filter).toContain('_type == "primarySource"')
		expect(documents.filter).not.toContain('location._ref')
		expect(documents.filter).toContain('date.year >= $decadeStart')
		expect(documents.filter).not.toContain('dateTaken.year')
	})

	test('matches photographer case-insensitively when opted in', () => {
		const images = buildFacetQuery(
			{photographer: 'John Doe'},
			{
				type: 'historicalImage',
				qFields: ['title'],
				yearField: 'dateTaken.year',
				includePhotographer: true,
				pageSize: 24,
			},
		)
		expect(images.filter).toContain(
			'defined(photographer) && lower(trim(photographer)) == $photographerKey',
		)
		expect(images.groqParams).toEqual({photographerKey: 'john doe'})
	})

	test('filters unattributed photographers when opted in', () => {
		const images = buildFacetQuery(
			{photographer: UNATTRIBUTED_PHOTOGRAPHER},
			{
				type: 'historicalImage',
				qFields: ['title'],
				yearField: 'dateTaken.year',
				includePhotographer: true,
				pageSize: 24,
			},
		)
		expect(images.filter).toContain(
			'(!defined(photographer) || length(trim(photographer)) == 0)',
		)
		expect(images.groqParams).toEqual({})
	})

	test('ignores blank query, invalid decade, location, and photographer unless opted in', () => {
		const images = buildFacetQuery(
			{
				q: '   ',
				location: 'loc-1',
				decade: 'nineteen',
				photographer: 'John Doe',
				page: 0,
			},
			{
				type: 'historicalImage',
				qFields: ['title'],
				yearField: 'dateTaken.year',
				pageSize: 24,
			},
		)
		expect(images.page).toBe(1)
		expect(images.filter).toBe('_type == "historicalImage"')
		expect(images.groqParams).toEqual({})
		expect(images.filter).not.toContain('location._ref')
		expect(images.filter).not.toContain('photographer')
	})
})
