import {describe, expect, test} from 'bun:test'

import {
	absoluteUrl,
	archiveIdStaticPaths,
	hrefFor,
	hubStaticPaths,
	isExternalHref,
	slugStaticPaths,
} from './href'

describe('hrefFor', () => {
	test('maps each catalog type to one path', () => {
		expect(hrefFor({_type: 'historicalImage', archiveId: 'MF37'})).toBe('/images/MF37')
		expect(hrefFor({_type: 'primarySource', archiveId: '941'})).toBe('/documents/941')
		expect(hrefFor({_type: 'researchArticle', slug: 'my-people-the-sioux'})).toBe(
			'/research/my-people-the-sioux',
		)
		expect(hrefFor({_type: 'quarterlyArticle', slug: 'five-boys-eat-apple-dumplings'})).toBe(
			'/quarterly/five-boys-eat-apple-dumplings',
		)
		expect(hrefFor({_type: 'person', slug: 'croasdale-john', _id: 'p1'})).toBe(
			'/people/croasdale-john',
		)
		expect(hrefFor({_type: 'township', slug: 'tredyffrin', _id: 't1'})).toBe('/places/tredyffrin')
		expect(hrefFor({_type: 'location', slug: 'paoli', _id: 'l1'})).toBe('/places/paoli')
		expect(hrefFor({_type: 'category', slug: 'schools', _id: 'c1'})).toBe('/subjects/schools')
		expect(hrefFor({_type: 'organization', slug: 'lincoln', _id: 'o1'})).toBe(
			'/organizations/lincoln',
		)
		expect(hrefFor({_type: 'business', slug: 'devon-inn', _id: 'b1'})).toBe(
			'/organizations/devon-inn',
		)
	})

	test('falls back to _id when slug is missing', () => {
		expect(hrefFor({_type: 'person', _id: 'p1'})).toBe('/people/p1')
		expect(hrefFor({_type: 'township', _id: 't1'})).toBe('/places/t1')
		expect(hrefFor({_type: 'category', _id: 'c1'})).toBe('/subjects/c1')
		expect(hrefFor({_type: 'organization', _id: 'o1'})).toBe('/organizations/o1')
		expect(hrefFor({_type: 'business', _id: 'b1'})).toBe('/organizations/b1')
	})

	test('falls back when the type is unknown or the key is missing', () => {
		expect(hrefFor({_type: 'historicalImage'})).toBe('/search')
		expect(hrefFor({_type: 'unknown'}, '/images')).toBe('/images')
	})
})

describe('hubStaticPaths', () => {
	test('emits a slug path and an _id redirect when they differ', () => {
		expect(
			hubStaticPaths([{_id: 'p1', slug: 'croasdale-john'}], '/people', (row) => ({person: row})),
		).toEqual([
			{params: {slug: 'croasdale-john'}, props: {person: {_id: 'p1', slug: 'croasdale-john'}}},
			{params: {slug: 'p1'}, redirect: '/people/croasdale-john'},
		])
	})

	test('emits only _id when that is the slug', () => {
		expect(hubStaticPaths([{_id: 'p1', slug: 'p1'}], '/people', (row) => ({person: row}))).toEqual([
			{params: {slug: 'p1'}, props: {person: {_id: 'p1', slug: 'p1'}}},
		])
	})
})

describe('archiveIdStaticPaths and slugStaticPaths', () => {
	test('uses archiveId or slug as the route param and skips missing keys', () => {
		expect(
			archiveIdStaticPaths(
				[{archiveId: 'MF37', title: 'Mill'}, {archiveId: null, title: 'Skip'}],
				(image) => ({image}),
			),
		).toEqual([{params: {archiveId: 'MF37'}, props: {image: {archiveId: 'MF37', title: 'Mill'}}}])

		expect(
			slugStaticPaths(
				[{slug: 'my-people-the-sioux', title: 'Sioux'}, {slug: '', title: 'Skip'}],
				(article) => ({article}),
			),
		).toEqual([
			{
				params: {slug: 'my-people-the-sioux'},
				props: {article: {slug: 'my-people-the-sioux', title: 'Sioux'}},
			},
		])
	})
})

describe('isExternalHref', () => {
	test('treats http(s) as external', () => {
		expect(isExternalHref('https://tehistory.org')).toBe(true)
		expect(isExternalHref('/research/foo')).toBe(false)
	})
})

describe('absoluteUrl', () => {
	const site = 'https://catalog.tehistory.org'

	test('returns undefined when path or site is missing for a relative path', () => {
		expect(absoluteUrl(undefined, site)).toBeUndefined()
		expect(absoluteUrl('/images/MF37', undefined)).toBeUndefined()
	})

	test('leaves http(s) URLs unchanged and resolves relative paths against site', () => {
		expect(absoluteUrl('https://cdn.sanity.io/x.jpg', site)).toBe('https://cdn.sanity.io/x.jpg')
		expect(absoluteUrl('/images/MF37', site)).toBe('https://catalog.tehistory.org/images/MF37')
	})
})
