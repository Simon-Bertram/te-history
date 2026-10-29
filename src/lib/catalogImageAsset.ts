/** Image objects from GROQ projections such as `imageFile` and `articleImage`. */
export type CatalogImageField = {
	_type?: 'image'
	alt?: string | null
	asset?: {
		_ref?: string
		_type?: string
		_id?: string
		metadata?: {
			dimensions?: {width?: number | null; height?: number | null} | null
		} | null
	} | null
	hotspot?: unknown
	crop?: unknown
} | null

/** True when GROQ left a usable asset (`_ref` or expanded `_id`). */
export function hasCatalogImageAsset(
	source: CatalogImageField | undefined,
): source is NonNullable<CatalogImageField> {
	const asset = source?.asset
	return Boolean(asset && (asset._ref || asset._id))
}
