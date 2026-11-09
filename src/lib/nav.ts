export interface NavLink {
	_key: string
	label: string
	href: string
	kind: 'page' | 'search'
	purpose?: string
}

export interface NavSubLink {
	_key: string
	label: string
	href: string
	purpose?: string
}

export interface NavMenu {
	_key: string
	label: string
	children: NavSubLink[]
	purpose?: string
}

export type NavItem = NavLink | NavMenu

export function isNavMenu(item: NavItem): item is NavMenu {
	return 'children' in item
}

export function isNavLink(item: NavItem): item is NavLink {
	return 'href' in item && !('children' in item)
}

export interface SiteNavigation {
	primaryLinks: NavItem[]
	secondaryLinks: NavItem[]
}
