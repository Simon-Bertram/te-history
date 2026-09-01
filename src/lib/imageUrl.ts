import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'
import {sanityClient} from 'sanity:client'

const builder = createImageUrlBuilder(sanityClient)

/** Image objects from GROQ projections such as `imageFile` and `articleImage`. */
export type CatalogImageField = {
	_type?: 'image'
	asset?: {_ref: string; _type?: string}
	hotspot?: unknown
	crop?: unknown
} | null

export function urlFor(source: SanityImageSource | NonNullable<CatalogImageField>) {
	return builder.image(source)
}

export type {SanityImageSource}
