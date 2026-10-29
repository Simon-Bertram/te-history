import {describe, expect, test} from 'bun:test'

import {hasCatalogImageAsset} from './catalogImageAsset'

describe('hasCatalogImageAsset', () => {
	test('is false for missing or empty image fields', () => {
		expect(hasCatalogImageAsset(undefined)).toBe(false)
		expect(hasCatalogImageAsset(null)).toBe(false)
		expect(hasCatalogImageAsset({})).toBe(false)
		expect(hasCatalogImageAsset({asset: null})).toBe(false)
		expect(hasCatalogImageAsset({asset: {}})).toBe(false)
	})

	test('is true for a ref-shaped asset', () => {
		expect(
			hasCatalogImageAsset({
				asset: {_type: 'reference', _ref: 'image-abc'},
			}),
		).toBe(true)
	})

	test('is true for an expanded asset->_id projection', () => {
		expect(
			hasCatalogImageAsset({
				asset: {_id: 'image-abc', metadata: {dimensions: {width: 100, height: 80}}},
			}),
		).toBe(true)
	})
})
