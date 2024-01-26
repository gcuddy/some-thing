import { Calendar, Gear, Star, Tray } from 'phosphor-svelte'
import type { SpecialListItem } from './types'
import { goto, preloadData, pushState } from '$app/navigation'
import { settingsOpen } from '@/stores/settings'

export const specials = [
	{
		type: 'special',
		data: {
			href: '/today',
			id: '__special__:today',
			name: 'Today',
			keywords: ['today'],
			icon: Star,
			iconClass: 'text-yellow-400',
			iconProps: {
				weight: 'fill'
			}
		}
	},
	{
		type: 'special',
		data: {
			href: '/',
			id: '__special__:inbox',
			name: 'Inbox',
			keywords: ['inbox'],
			icon: Tray,
			iconClass: 'text-accent',
			iconProps: {
				weight: 'duotone'
			}
		}
	},
	{
		type: 'special',
		data: {
			href: '/upcoming',
			id: '__special__:upcoming',
			name: 'Upcoming',
			keywords: ['upcoming'],
			icon: Calendar,
			iconClass: 'text-red-400',
			iconProps: {
				weight: 'fill'
			}
		}
	},
	{
		type: 'special',
		data: {
			href: '/settings/general',
			id: '__special__:settings',
			name: 'Settings',
			keywords: ['settings', 'preferences'],
			icon: Gear,
			iconClass: 'text-gray-400',
			iconProps: {
				weight: 'fill'
			},
			fn: async () => {
				// shallow routing
				const href = '/settings/general'
				const result = await preloadData(href)

				if (result.type === 'loaded' && result.status === 200) {
					pushState(href, {})
					settingsOpen.set(true)
				} else {
					goto(href)
				}
			}
		}
	}
] as const satisfies Array<SpecialListItem>
