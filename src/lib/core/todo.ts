import { zod } from '$lib/util/zod'
import { z } from 'zod'

export const Todo = z.object({
	id: z.string(),
	text: z.string(),
	completed: z.boolean()
})

export const createtodo = zod(Todo.shape.text, async text => {
	// TODO: Implement
})

export const updatetodo = zod(
	z.object({
		id: Todo.shape.id.array(),
		data: Todo.omit({ id: true }).partial()
	}),
	async id => {
		// TODO: Implement
	}
)
