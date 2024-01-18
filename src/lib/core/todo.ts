import { zod } from '$lib/util/zod'
import { z } from 'zod'
import { todos } from './todo/todo.sql'
import { nanoid } from 'nanoid'
import { createSelectSchema } from 'drizzle-zod'
import { eq, inArray } from 'drizzle-orm'

export const Todo = createSelectSchema(todos)

export type Todo = z.infer<typeof Todo>

export const createtodo = zod(Todo.shape.text, async (text, locals) => {
	return locals.DB.transaction(async tx =>
		tx.insert(todos).values({
			id: nanoid(),
			text,
			userId: locals.user!.id
		})
	)
})

export const updatetodo = zod(
	z.object({
		id: Todo.shape.id.array(),
		data: Todo.omit({ id: true }).partial()
	}),
	async ({ id, data }, locals) => {
		return locals.DB.transaction(async tx =>
			tx
				.update(todos)
				.set({
					...data,
					userId: locals.user!.id
				})
				.where(inArray(todos.id, id))
		)
	}
)

export const deletetodo = zod(
	z.object({
		ids: Todo.shape.id.array(),
		archive: z.boolean().default(false).optional()
	}),
	async ({ ids, archive }, locals) => {
		// TODO: Implement
		if (archive) {
			return locals.DB.transaction(async tx =>
				tx
					.update(todos)
					.set({
						archivedAt: new Date()
					})
					.where(inArray(todos.id, ids))
			)
		} else {
			return locals.DB.transaction(async tx => tx.delete(todos).where(inArray(todos.id, ids)))
		}
	}
)
