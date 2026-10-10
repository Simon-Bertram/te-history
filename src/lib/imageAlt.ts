/**
 * Resolve img alt: embed/view override → catalog imageFile.alt → caption/title.
 */
export function catalogImageAlt(options: {
	override?: string | null
	imageFile?: {alt?: string | null} | null
	title?: string | null
}): string {
	const override = options.override?.trim()
	if (override) return override
	const catalog = options.imageFile?.alt?.trim()
	if (catalog) return catalog
	return options.title?.trim() ?? ''
}
