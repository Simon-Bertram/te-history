import {describe, expect, test} from 'bun:test'

import {
	diversifyCatalogImages,
	isOutsideLocalArea,
	isUntitled,
	mergeFeaturedWithFallback,
	scoreCatalogImage,
	type CatalogImage,
} from './imageHighlights'

function image(partial: Partial<CatalogImage> & Pick<CatalogImage, '_id'>): CatalogImage {
	return {
		title: 'Berwyn station',
		archiveId: null,
		description: 'A dated local view',
		dateTaken: {year: 1910},
		featuredOnSite: null,
		featuredRank: null,
		imageFile: {},
		township: 'Tredyffrin',
		location: null,
		subjects: ['Railroad'],
		...partial,
	}
}

describe('scoreCatalogImage', () => {
	test('rejects untitled, OLA, and missing files', () => {
		expect(scoreCatalogImage(image({_id: '1', title: 'Untitled house'}))).toBeLessThan(0)
		expect(scoreCatalogImage(image({_id: '2', archiveId: 'OLA12'}))).toBeLessThan(0)
		expect(scoreCatalogImage(image({_id: '3', imageFile: undefined}))).toBeLessThan(0)
	})

	test('prefers Tredyffrin or Easttown and early dated civic subjects', () => {
		const local = scoreCatalogImage(image({_id: 'a'}))
		const valley = scoreCatalogImage(
			image({_id: 'b', township: 'Upper Merion', location: 'Valley Forge'}),
		)
		const elsewhere = scoreCatalogImage(image({_id: 'c', township: 'Charlestown', location: ''}))
		const fuzzy = scoreCatalogImage(
			image({_id: 'd', subjects: ['Person', 'View'], township: 'Tredyffrin'}),
		)
		expect(local).toBeGreaterThan(valley)
		expect(valley).toBeGreaterThan(elsewhere)
		expect(local).toBeGreaterThan(fuzzy)
	})
})

describe('diversifyCatalogImages', () => {
	test('caps a subject so houses cannot fill the grid', () => {
		const houses = Array.from({length: 10}, (_, index) =>
			image({
				_id: `h${index}`,
				title: `House ${index}`,
				subjects: ['House'],
				dateTaken: {year: 1900 + index},
			}),
		)
		const picked = diversifyCatalogImages(houses, 8)
		expect(picked.length).toBeLessThanOrEqual(4)
	})
})

describe('mergeFeaturedWithFallback', () => {
	test('keeps featured images first and fills from the scored pool', () => {
		const featured = [
			image({_id: 'f1', featuredOnSite: true, featuredRank: 2, title: 'Second'}),
			image({_id: 'f2', featuredOnSite: true, featuredRank: 1, title: 'First'}),
		]
		const fallback = [
			image({_id: 'x', title: 'Schoolhouse', subjects: ['School'], dateTaken: {year: 1920}}),
		]
		const merged = mergeFeaturedWithFallback(featured, fallback, 3)
		expect(merged.map((item) => item._id)).toEqual(['f2', 'f1', 'x'])
	})

	test('does not need a fallback pool when featured already fills the limit', () => {
		const featured = [
			image({_id: 'f1', featuredOnSite: true, featuredRank: 1}),
			image({_id: 'f2', featuredOnSite: true, featuredRank: 2}),
		]
		expect(mergeFeaturedWithFallback(featured, [], 2).map((item) => item._id)).toEqual([
			'f1',
			'f2',
		])
	})
})

describe('title helpers', () => {
	test('detects untitled and outside-local identifiers', () => {
		expect(isUntitled(image({_id: '1', title: 'Untitled scan'}))).toBe(true)
		expect(isOutsideLocalArea(image({_id: '2', archiveId: 'ola9'}))).toBe(true)
	})
})
