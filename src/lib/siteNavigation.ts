import {sanityClient} from 'sanity:client'

import {
	SITE_NAVIGATION_PRIMARY_LINKS,
	SITE_NAVIGATION_SECONDARY_LINKS,
} from './navFallback'

export interface NavLink {
	_key: string
	label: string
	href: string
	kind: 'page' | 'search'
	purpose?: string
}

export interface SiteNavigation {
	primaryLinks: NavLink[]
	secondaryLinks: NavLink[]
}

const SITE_NAVIGATION_QUERY = /* groq */ `
	*[_id == "siteNavigation"][0]{
		primaryLinks[]{_key, label, href, kind, purpose},
		secondaryLinks[]{_key, label, href, kind, purpose}
	}
`

function asLinks(value: unknown, fallback: NavLink[]): NavLink[] {
	if (!Array.isArray(value) || value.length === 0) return fallback
	const links: NavLink[] = []
	for (const item of value) {
		if (!item || typeof item !== 'object') continue
		const record = item as Record<string, unknown>
		if (typeof record.label !== 'string' || typeof record.href !== 'string') continue
		links.push({
			_key: typeof record._key === 'string' ? record._key : record.href,
			label: record.label,
			href: record.href,
			kind: record.kind === 'search' ? 'search' : 'page',
			purpose: typeof record.purpose === 'string' ? record.purpose : undefined,
		})
	}
	return links.length > 0 ? links : fallback
}

export async function getSiteNavigation(): Promise<SiteNavigation> {
	try {
		const doc = await sanityClient.fetch(SITE_NAVIGATION_QUERY)
		return {
			primaryLinks: asLinks(doc?.primaryLinks, SITE_NAVIGATION_PRIMARY_LINKS),
			secondaryLinks: asLinks(doc?.secondaryLinks, SITE_NAVIGATION_SECONDARY_LINKS),
		}
	} catch {
		return {
			primaryLinks: SITE_NAVIGATION_PRIMARY_LINKS,
			secondaryLinks: SITE_NAVIGATION_SECONDARY_LINKS,
		}
	}
}

export function pageLinks(links: NavLink[]): NavLink[] {
	return links.filter((link) => link.kind !== 'search')
}

export function hasSearchControl(links: NavLink[]): boolean {
	return links.some((link) => link.kind === 'search')
}

export function searchHref(links: NavLink[]): string {
	return links.find((link) => link.kind === 'search')?.href ?? '/search'
}
