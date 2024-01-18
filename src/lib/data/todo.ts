import type { Todo } from '$lib/core/todo'
import { Store } from './store'

export const TodoStore = new Store()
	.$type<Todo>()
	.scan('list', () => ['todo'])
	.get((id: string) => ['todo', id])
	.build()
