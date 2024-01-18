import { zod } from '$lib/util/zod'
import { z } from 'zod'

export const Todo = z.object({
	id: z.string(),
	text: z.string(),
	completed: z.boolean(),
	archivedAt: z.coerce.date().nullable().default(null)
})

export type Todo = z.infer<typeof Todo>

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

export const deletetodo = zod(
	z.object({
		ids: Todo.shape.id.array(),
		archive: z.boolean().default(false).optional()
	}),
	async ids => {
		// TODO: Implement
	}
)
