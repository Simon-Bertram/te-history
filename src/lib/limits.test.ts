import {describe, expect, test} from 'bun:test'

import {
	isFuzzySubject,
	parseImageSort,
	sortSubjectsDemoteFuzzy,
	sortTownshipsFirst,
} from './limits'

describe('parseImageSort', () => {
	test('accepts known sorts and defaults to newest date', () => {
		expect(parseImageSort('date-asc')).toBe('date-asc')
		expect(parseImageSort('title')).toBe('title')
		expect(parseImageSort('nope')).toBe('date-desc')
	})
})

describe('facet ordering', () => {
	test('puts Tredyffrin and Easttown first', () => {
		const names = sortTownshipsFirst([
			{name: 'Willistown'},
			{name: 'Easttown'},
			{name: 'Tredyffrin'},
		]).map((item) => item.name)
		expect(names).toEqual(['Tredyffrin', 'Easttown', 'Willistown'])
	})

	test('demotes fuzzy Person/Place/View subjects', () => {
		const titles = sortSubjectsDemoteFuzzy([
			{title: 'View'},
			{title: 'Railroad'},
			{title: 'School'},
		]).map((item) => item.title)
		expect(titles).toEqual(['Railroad', 'School', 'View'])
		expect(isFuzzySubject('Person')).toBe(true)
	})
})
