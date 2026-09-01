import {describe, expect, test} from 'bun:test'

import {buildFacetQuery, pageSlice} from './facets'

describe('pageSlice', () => {
	test('uses exclusive GROQ end indexes', () => {
		expect(pageSlice(1, 24)).toEqual({start: 0, end: 24})
		expect(pageSlice(2, 24)).toEqual({start: 24, end: 48})
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
})
