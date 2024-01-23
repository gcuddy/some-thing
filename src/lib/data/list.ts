import type { List } from '$lib/core/list'
import { Store } from './store'

export const ListStore = new Store()
	.$type<List>()
	.scan('list', () => ['lists'])
	.get((id: string) => ['lists', id])
	.build()
