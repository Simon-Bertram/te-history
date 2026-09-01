import {describe, expect, test} from 'bun:test'

import {groupSearchHits} from './searchGroups'

describe('groupSearchHits', () => {
	test('returns no groups for a blank query', () => {
		expect(groupSearchHits('  ', {images: [{_id: '1', _type: 'historicalImage'}]})).toEqual({
			query: '',
			groups: [],
		})
	})

	test('omits empty types and maps titles, hrefs, and meta', () => {
		const grouped = groupSearchHits('paoli', {
			images: [{_id: 'i1', _type: 'historicalImage', title: 'Station', archiveId: 'MF37'}],
			documents: [
				{
					_id: 'd1',
					_type: 'primarySource',
					title: 'Deed',
					archiveId: '941',
					newspaper: 'Local',
				},
			],
			quarterly: [],
			research: [{_id: 'r1', _type: 'researchArticle', title: 'Sioux', slug: 'my-people-the-sioux'}],
			people: [{_id: 'p1', _type: 'person', firstName: 'John', lastName: 'Croasdale', slug: 'p1'}],
			places: [{_id: 'l1', _type: 'location', name: 'Paoli', slug: 'l1'}],
		})
		expect(grouped.query).toBe('paoli')
		expect(grouped.groups.map((group) => group.label)).toEqual([
			'Images',
			'Documents',
			'Research',
			'People',
			'Places',
		])
		expect(grouped.groups[0]?.hits[0]).toEqual({
			_id: 'i1',
			_type: 'historicalImage',
			title: 'Station',
			href: '/images/MF37',
			meta: 'MF37',
		})
		expect(grouped.groups[1]?.hits[0]?.meta).toBe('Local')
		expect(grouped.groups[2]?.hits[0]?.href).toBe('/research/my-people-the-sioux')
		expect(grouped.groups[3]?.hits[0]?.title).toBe('John Croasdale')
		expect(grouped.groups[3]?.hits[0]?.href).toBe('/people/p1')
		expect(grouped.groups[4]?.hits[0]?.title).toBe('Paoli')
		expect(grouped.groups[4]?.hits[0]?.href).toBe('/places/l1')
	})

	test('pins an exact Archive ID image match first', () => {
		const grouped = groupSearchHits('MF37', {
			images: [
				{_id: 'a', _type: 'historicalImage', title: 'Other', archiveId: 'MF01'},
				{_id: 'b', _type: 'historicalImage', title: 'Exact', archiveId: 'MF37'},
			],
		})
		expect(grouped.groups[0]?.hits.map((hit) => hit.meta)).toEqual(['MF37', 'MF01'])
	})
})
