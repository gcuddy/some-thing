import { Calendar, Star, Tray } from 'phosphor-svelte'
import type { SpecialListItem } from './types'

export const specials = [
	{
		type: 'special',
		data: {
			href: '/today',
			id: '__special__:today',
			name: 'Today',
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
			icon: Calendar,
			iconClass: 'text-red-400',
			iconProps: {
				weight: 'fill'
			}
		}
	}
] as const satisfies Array<SpecialListItem>
