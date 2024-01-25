import { browser } from '$app/environment'
import type { Todo } from '@/core/todo'
import { ListStore } from '@/data/list'

export async function load({ params, parent, fetch }) {
	if (!browser) {
		const todos = await fetch('/api/todos?listId=' + params.id).then(r => r.json())

		return {
			id: params.id,
			todos: todos as Todo[]
		}
	}
	//
	return {
		id: params.id
	}
}
