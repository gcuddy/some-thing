import type { Todo } from '$lib/core/todo'
import { Store } from './store'

export const TodoStore = new Store()
	.$type<Todo>()
	.scan('list', () => ['todos'])
	.get((id: string) => ['todos', id])
	.build()
