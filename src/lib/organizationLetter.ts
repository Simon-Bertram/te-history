const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function parseOrganizationLetter(value: string | undefined): string {
	const trimmed = (value ?? '').trim().toUpperCase()
	if (trimmed === '#') return '#'
	if (trimmed.length === 1 && LETTERS.includes(trimmed)) return trimmed
	return ''
}

/** GROQ clause for A–Z / `#` string-field browse. Empty string means no letter filter. */
export function letterFieldFilter(field: string, letter: string): string | undefined {
	if (!letter) return undefined
	if (letter === '#') {
		return `!(lower(${field}) >= "a" && lower(${field}) < "{")`
	}
	const start = letter.toLowerCase()
	const end = String.fromCharCode(start.charCodeAt(0) + 1)
	return `lower(${field}) >= "${start}" && lower(${field}) < "${end}"`
}

/** GROQ clause for A–Z / `#` name browse. Empty string means no letter filter. */
export function organizationLetterFilter(letter: string): string | undefined {
	return letterFieldFilter('name', letter)
}

export type OrganizationKind = 'business' | 'organization'

export function parseOrganizationKind(value: string | undefined): OrganizationKind | '' {
	const trimmed = (value ?? '').trim()
	if (trimmed === 'business' || trimmed === 'organization') return trimmed
	return ''
}
