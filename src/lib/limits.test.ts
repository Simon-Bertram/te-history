import {describe, expect, test} from 'bun:test'

import {
	DECADE_STARTS,
	isFuzzySubject,
	parseImageSort,
	parsePage,
	sortSubjectsDemoteFuzzy,
	sortTownshipsFirst,
} from './limits'

describe('parsePage', () => {
	test('keeps positive integers and otherwise returns 1', () => {
		expect(parsePage('2')).toBe(2)
		expect(parsePage('1')).toBe(1)
		expect(parsePage(undefined)).toBe(1)
		expect(parsePage('0')).toBe(1)
		expect(parsePage('-3')).toBe(1)
		expect(parsePage('1.5')).toBe(1)
		expect(parsePage('nope')).toBe(1)
	})
})

describe('parseImageSort', () => {
	test('accepts known sorts and defaults to newest date', () => {
		expect(parseImageSort('date-asc')).toBe('date-asc')
		expect(parseImageSort('title')).toBe('title')
		expect(parseImageSort('nope')).toBe('date-desc')
	})
})

describe('DECADE_STARTS', () => {
	test('includes 2000, 2010, and 2020', () => {
		expect(DECADE_STARTS).toContain(2000)
		expect(DECADE_STARTS).toContain(2010)
		expect(DECADE_STARTS).toContain(2020)
		expect(DECADE_STARTS.at(-1)).toBe(2020)
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
