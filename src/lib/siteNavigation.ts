import {defineQuery} from 'groq'
import {sanityClient} from 'sanity:client'

import type {NavItem, NavLink, NavSubLink, SiteNavigation} from './nav'
import {isNavLink, isNavMenu} from './nav'
import {
	SITE_NAVIGATION_PRIMARY_LINKS,
	SITE_NAVIGATION_SECONDARY_LINKS,
} from './navFallback'

export type {NavItem, NavLink, NavMenu, NavSubLink, SiteNavigation} from './nav'
export {isNavLink, isNavMenu} from './nav'

export const SITE_NAVIGATION_QUERY = defineQuery(/* groq */ `
	*[_id == "siteNavigation"][0]{
		primaryLinks[]{
			_key,
			_type,
			label,
			href,
			kind,
			purpose,
			children[]{_key, _type, label, href, purpose}
		},
		secondaryLinks[]{
			_key,
			_type,
			label,
			href,
			kind,
			purpose,
			children[]{_key, _type, label, href, purpose}
		}
	}
`)

function asSubLinks(value: unknown): NavSubLink[] {
	if (!Array.isArray(value)) return []
	const links: NavSubLink[] = []
	for (const item of value) {
		if (!item || typeof item !== 'object') continue
		const record = item as Record<string, unknown>
		if (typeof record.label !== 'string' || typeof record.href !== 'string') {
			continue
		}
		links.push({
			_key: typeof record._key === 'string' ? record._key : record.href,
			label: record.label,
			href: record.href,
			purpose:
				typeof record.purpose === 'string' ? record.purpose : undefined,
		})
	}
	return links
}

function asNavItems(value: unknown, fallback: NavItem[]): NavItem[] {
	if (!Array.isArray(value) || value.length === 0) return fallback
	const items: NavItem[] = []
	for (const item of value) {
		if (!item || typeof item !== 'object') continue
		const record = item as Record<string, unknown>
		if (typeof record.label !== 'string') continue

		const children = asSubLinks(record.children)
		const isMenu =
			record._type === 'navMenu' ||
			(Array.isArray(record.children) && children.length > 0)

		if (isMenu) {
			if (children.length === 0) continue
			items.push({
				_key:
					typeof record._key === 'string' ? record._key : record.label,
				label: record.label,
				children,
				purpose:
					typeof record.purpose === 'string' ? record.purpose : undefined,
			})
			continue
		}

		if (typeof record.href !== 'string') continue
		items.push({
			_key: typeof record._key === 'string' ? record._key : record.href,
			label: record.label,
			href: record.href,
			kind: record.kind === 'search' ? 'search' : 'page',
			purpose:
				typeof record.purpose === 'string' ? record.purpose : undefined,
		})
	}
	return items.length > 0 ? items : fallback
}

export async function getSiteNavigation(): Promise<SiteNavigation> {
	try {
		const doc = await sanityClient.fetch(SITE_NAVIGATION_QUERY)
		return {
			primaryLinks: asNavItems(
				doc?.primaryLinks,
				SITE_NAVIGATION_PRIMARY_LINKS,
			),
			secondaryLinks: asNavItems(
				doc?.secondaryLinks,
				SITE_NAVIGATION_SECONDARY_LINKS,
			),
		}
	} catch (error) {
		console.error(
			'[siteNavigation] Sanity fetch failed; using fallback links',
			error,
		)
		return {
			primaryLinks: SITE_NAVIGATION_PRIMARY_LINKS,
			secondaryLinks: SITE_NAVIGATION_SECONDARY_LINKS,
		}
	}
}

/** Header items: page leaves and menus; exclude Search leaves. */
export function pageLinks(items: NavItem[]): NavItem[] {
	return items.filter((item) => !isNavLink(item) || item.kind !== 'search')
}

/** Flat page links for footer: leaves + menu children; no Search. */
export function flattenPageLinks(items: NavItem[]): NavLink[] {
	const links: NavLink[] = []
	for (const item of items) {
		if (isNavMenu(item)) {
			for (const child of item.children) {
				links.push({
					_key: child._key,
					label: child.label,
					href: child.href,
					kind: 'page',
					purpose: child.purpose,
				})
			}
			continue
		}
		if (item.kind === 'search') continue
		links.push(item)
	}
	return links
}

export function hasSearchControl(items: NavItem[]): boolean {
	return items.some((item) => isNavLink(item) && item.kind === 'search')
}

export function searchHref(items: NavItem[]): string {
	const search = items.find(
		(item) => isNavLink(item) && item.kind === 'search',
	)
	return search && isNavLink(search) ? search.href : '/search'
}
