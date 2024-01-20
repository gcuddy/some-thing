import { zod } from '$lib/util/zod'
import { z } from 'zod'
import { todos } from './todo/todo.sql'
import { nanoid } from 'nanoid'
import { createSelectSchema } from 'drizzle-zod'
import { eq, inArray } from 'drizzle-orm'
import { useTransaction } from '$lib/util/transaction'
import { useUser } from './user'

export const Todo = createSelectSchema(todos, {
	completed: z.coerce.date(),
	archivedAt: z.coerce.date()
})

export type Todo = z.infer<typeof Todo>

export const createtodo = zod(Todo.shape.text, async text =>
	useTransaction(tx =>
		tx.insert(todos).values({
			id: nanoid(),
			text,
			userId: useUser()
		})
	)
)

export const updatetodo = zod(
	z.object({
		id: Todo.shape.id.array(),
		data: Todo.omit({ id: true }).partial()
	}),
	async ({ id, data }) => {
		return useTransaction(async tx =>
			tx
				.update(todos)
				.set({
					...data,
					userId: useUser()
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
	async ({ ids, archive }) => {
		// TODO: Implement
		// if (archive) {
		return useTransaction(async tx =>
			tx
				.update(todos)
				.set({
					archivedAt: new Date()
				})
				.where(inArray(todos.id, ids))
		)
		// } else {
		// 	return ctx.DB.transaction(async tx => tx.delete(todos).where(inArray(todos.id, ids)))
		// }
	}
)
