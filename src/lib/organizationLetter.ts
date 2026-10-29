const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function parseOrganizationLetter(value: string | undefined): string {
	const trimmed = (value ?? '').trim().toUpperCase()
	if (trimmed === '#') return '#'
	if (trimmed.length === 1 && LETTERS.includes(trimmed)) return trimmed
	return ''
}

/** GROQ clause for A–Z / `#` name browse. Empty string means no letter filter. */
export function organizationLetterFilter(letter: string): string | undefined {
	if (!letter) return undefined
	if (letter === '#') {
		return '!(lower(name) >= "a" && lower(name) < "{")'
	}
	const start = letter.toLowerCase()
	const end = String.fromCharCode(start.charCodeAt(0) + 1)
	return `lower(name) >= "${start}" && lower(name) < "${end}"`
}
