import {describe, expect, test} from 'bun:test'

import {hrefFor, isExternalHref} from './href'

describe('hrefFor', () => {
	test('maps each catalog type to one path', () => {
		expect(hrefFor({_type: 'historicalImage', archiveId: 'MF37'})).toBe('/images/MF37')
		expect(hrefFor({_type: 'primarySource', archiveId: '941'})).toBe('/documents/941')
		expect(hrefFor({_type: 'researchArticle', slug: 'my-people-the-sioux'})).toBe(
			'/research/my-people-the-sioux',
		)
		expect(hrefFor({_type: 'quarterlyArticle', sourceUrl: 'https://tehistory.org/q'})).toBe(
			'https://tehistory.org/q',
		)
		expect(hrefFor({_type: 'person', _id: 'p1'})).toBe('/people/p1')
		expect(hrefFor({_type: 'township', _id: 't1'})).toBe('/places/t1')
		expect(hrefFor({_type: 'location', _id: 'l1'})).toBe('/places/l1')
		expect(hrefFor({_type: 'category', _id: 'c1'})).toBe('/subjects/c1')
	})

	test('falls back when the type is unknown or the key is missing', () => {
		expect(hrefFor({_type: 'historicalImage'})).toBe('/search')
		expect(hrefFor({_type: 'unknown'}, '/images')).toBe('/images')
	})
})

describe('isExternalHref', () => {
	test('treats http(s) as external', () => {
		expect(isExternalHref('https://tehistory.org')).toBe(true)
		expect(isExternalHref('/research/foo')).toBe(false)
	})
})
