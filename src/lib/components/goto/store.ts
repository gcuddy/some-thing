import { writable } from 'svelte/store'
import type { ListItem, SpecialListItem } from './types'
import { specials } from './data'

type SpecialNames = (typeof specials)[number]['data']['name']

export function createRecentsStore() {
	const { subscribe, set, update } = writable<Array<SpecialListItem | ListItem>>([])

	function add(item: ListItem | SpecialNames) {
		const _item = typeof item === 'string' ? specials.find(s => s.data.name === item)! : item
		update(items => {
			if (items.findIndex(i => i.data.id === _item.data.id) === -1) {
				items.unshift(_item)
			} else {
				items.splice(
					items.findIndex(i => i.data.id === _item.data.id),
					1
				)
				items.unshift(_item)
			}
			// limit to 6
			return items.slice(0, 6)
		})
	}

	function remove(item: ListItem | SpecialNames) {
		const _item = typeof item === 'string' ? specials.find(s => s.data.name === item)! : item
		update(items => {
			items.splice(
				items.findIndex(i => i.data.id === _item.data.id),
				1
			)
			return items
		})
	}

	return {
		add,
		subscribe,
		remove
	}
}

export const recents = createRecentsStore()
