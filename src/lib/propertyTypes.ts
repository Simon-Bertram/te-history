export const PROPERTY_TYPES = [
	{value: 'dwelling', label: 'Dwelling / House'},
	{value: 'estate', label: 'Estate / Farm'},
	{value: 'church', label: 'Church'},
	{value: 'inn', label: 'Inn / Tavern'},
	{value: 'industrial', label: 'Industrial'},
	{value: 'institutional', label: 'Institutional'},
	{value: 'railroad', label: 'Railroad / Station'},
] as const

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number]['value']

const PROPERTY_TYPE_VALUES = new Set<string>(PROPERTY_TYPES.map((item) => item.value))

export function parsePropertyType(value: string | undefined): PropertyTypeValue | '' {
	const trimmed = (value ?? '').trim()
	return PROPERTY_TYPE_VALUES.has(trimmed) ? (trimmed as PropertyTypeValue) : ''
}

export function propertyTypeLabel(value: string | null | undefined): string {
	const match = PROPERTY_TYPES.find((item) => item.value === value)
	return match?.label ?? (value ? value : '')
}
