import {describe, expect, test} from 'bun:test'

import {organizationLetterFilter, parseOrganizationLetter} from './organizationLetter'

describe('parseOrganizationLetter', () => {
	test('accepts A–Z and #', () => {
		expect(parseOrganizationLetter('a')).toBe('A')
		expect(parseOrganizationLetter('Z')).toBe('Z')
		expect(parseOrganizationLetter('#')).toBe('#')
	})

	test('rejects empty and invalid values', () => {
		expect(parseOrganizationLetter(undefined)).toBe('')
		expect(parseOrganizationLetter('')).toBe('')
		expect(parseOrganizationLetter('AB')).toBe('')
		expect(parseOrganizationLetter('1')).toBe('')
	})
})

describe('organizationLetterFilter', () => {
	test('builds A–Z and # clauses', () => {
		expect(organizationLetterFilter('')).toBeUndefined()
		expect(organizationLetterFilter('A')).toBe('lower(name) >= "a" && lower(name) < "b"')
		expect(organizationLetterFilter('Z')).toBe('lower(name) >= "z" && lower(name) < "{"')
		expect(organizationLetterFilter('#')).toBe('!(lower(name) >= "a" && lower(name) < "{")')
	})
})
