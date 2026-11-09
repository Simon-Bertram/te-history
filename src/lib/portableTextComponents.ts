import HistoricalImageEmbed from '../components/HistoricalImageEmbed.astro'
import InternalSubLinks from '../components/InternalSubLinks.astro'
import PageBreak from '../components/PageBreak.astro'
import PortableTextImage from '../components/PortableTextImage.astro'
import PortableTextTable from '../components/PortableTextTable.astro'

export const portableTextComponents = {
	type: {
		historicalImageEmbed: HistoricalImageEmbed,
		image: PortableTextImage,
		internalSubLinks: InternalSubLinks,
		pageBreak: PageBreak,
		table: PortableTextTable,
	},
}
