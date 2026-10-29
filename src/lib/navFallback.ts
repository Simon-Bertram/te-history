import type {NavLink} from './nav'

export const SITE_NAVIGATION_PRIMARY_LINKS: NavLink[] = [
	{_key: 'nav-home', label: 'Home', href: '/', kind: 'page'},
	{_key: 'nav-quarterly', label: 'Quarterly', href: '/quarterly', kind: 'page'},
	{_key: 'nav-images', label: 'Images', href: '/images', kind: 'page'},
	{_key: 'nav-documents', label: 'Documents', href: '/documents', kind: 'page'},
	{_key: 'nav-research', label: 'Research', href: '/research', kind: 'page'},
	{_key: 'nav-search', label: 'Search', href: '/search', kind: 'search'},
]

export const SITE_NAVIGATION_SECONDARY_LINKS: NavLink[] = [
	{_key: 'nav-places', label: 'Places', href: '/places', kind: 'page'},
	{_key: 'nav-people', label: 'People', href: '/people', kind: 'page'},
	{_key: 'nav-subjects', label: 'Subjects', href: '/subjects', kind: 'page'},
	{_key: 'nav-organizations', label: 'Organizations', href: '/organizations', kind: 'page'},
	{_key: 'nav-about', label: 'About', href: '/about', kind: 'page'},
]
