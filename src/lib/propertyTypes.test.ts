import {describe, expect, test} from 'bun:test'

import {parsePropertyType, propertyTypeLabel} from './propertyTypes'

describe('parsePropertyType', () => {
	test('accepts known property types', () => {
		expect(parsePropertyType('dwelling')).toBe('dwelling')
		expect(parsePropertyType('estate')).toBe('estate')
		expect(parsePropertyType('railroad')).toBe('railroad')
	})

	test('rejects empty and invalid values', () => {
		expect(parsePropertyType(undefined)).toBe('')
		expect(parsePropertyType('')).toBe('')
		expect(parsePropertyType('Dwelling')).toBe('')
		expect(parsePropertyType('barn')).toBe('')
	})
})

describe('propertyTypeLabel', () => {
	test('returns the Studio label for known types', () => {
		expect(propertyTypeLabel('inn')).toBe('Inn / Tavern')
		expect(propertyTypeLabel('unknown')).toBe('unknown')
		expect(propertyTypeLabel(null)).toBe('')
	})
})
