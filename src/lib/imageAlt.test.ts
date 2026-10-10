import {describe, expect, test} from 'bun:test'

import {catalogImageAlt} from './imageAlt'

describe('catalogImageAlt', () => {
	test('prefers override, then catalog alt, then title', () => {
		expect(
			catalogImageAlt({
				override: 'Embed alt',
				imageFile: {alt: 'Catalog alt'},
				title: 'Caption',
			}),
		).toBe('Embed alt')
		expect(
			catalogImageAlt({
				imageFile: {alt: 'Catalog alt'},
				title: 'Caption',
			}),
		).toBe('Catalog alt')
		expect(catalogImageAlt({title: 'Caption'})).toBe('Caption')
		expect(catalogImageAlt({})).toBe('')
	})

	test('treats whitespace-only as empty', () => {
		expect(
			catalogImageAlt({
				override: '  ',
				imageFile: {alt: '  '},
				title: ' Caption ',
			}),
		).toBe('Caption')
	})
})
