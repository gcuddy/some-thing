import { Store } from './store'

export const TodoStore = new Store()
	.$type<{
		id: string
		text: string
		done: boolean
	}>()
	.scan('list', () => ['todo'])
	.get((id: string) => ['todo', id])
	.build()
