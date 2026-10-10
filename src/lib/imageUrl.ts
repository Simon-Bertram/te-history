import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {sanityClient} from 'sanity:client'

const builder = createImageUrlBuilder(sanityClient)

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

export function urlFor(source: SanityImageSource | NonNullable<CatalogImageField>) {
	return builder.image(source)
}

export const GRID_IMAGE_WIDTHS = [400, 720, 1080] as const
export const DETAIL_IMAGE_WIDTHS = [800, 1200, 1600] as const

const GRID_ASPECT = 3 / 4

export function catalogGridSrc(source: NonNullable<CatalogImageField>, width: number) {
	return urlFor(source)
		.width(width)
		.height(Math.round(width * GRID_ASPECT))
		.fit('crop')
		.auto('format')
		.url()
}

export function catalogDetailSrc(source: NonNullable<CatalogImageField>, width: number) {
	return urlFor(source).width(width).fit('max').auto('format').url()
}

export function srcsetFromWidths(
	source: NonNullable<CatalogImageField>,
	widths: readonly number[],
	srcForWidth: (source: NonNullable<CatalogImageField>, width: number) => string,
) {
	return widths.map((width) => `${srcForWidth(source, width)} ${width}w`).join(', ')
}

export function intrinsicSize(
	source: NonNullable<CatalogImageField>,
	displayWidth: number,
): {width: number; height: number} {
	const width = source.asset?.metadata?.dimensions?.width
	const height = source.asset?.metadata?.dimensions?.height
	if (typeof width === 'number' && typeof height === 'number' && width > 0) {
		return {width: displayWidth, height: Math.round((displayWidth * height) / width)}
	}
	return {width: displayWidth, height: Math.round(displayWidth * GRID_ASPECT)}
}

export type {SanityImageSource}
