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
