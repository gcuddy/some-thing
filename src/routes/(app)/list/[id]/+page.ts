// import { browser } from '$app/environment'
// import type { Todo } from '@/core/todo'

export async function load({ params }) {
	// if (!browser) { const todos = await fetch('/api/todos?listId=' + params.id).then(r => r.json())

	// 	return {
	// 		id: params.id,
	// 		todos: todos as Todo[]
	// 	}
	// }
	// //
	return {
		id: params.id
	}
}
