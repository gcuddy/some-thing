import { zod } from '$lib/util/zod'
import { z } from 'zod'
import { todos } from './todo/todo.sql'
import { nanoid } from 'nanoid'
import { createSelectSchema } from 'drizzle-zod'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { useTransaction } from '$lib/util/transaction'
import { useUser } from './user'

export const Todo = createSelectSchema(todos, {
	completed: z.coerce.date(),
	archivedAt: z.coerce.date(),
	timeUpdated: z.coerce.date(),
	startDate: z.coerce.date()
})

export type Todo = z.infer<typeof Todo>

const insertTodoSchema = Todo.partial().required({ text: true })

export const create = zod(insertTodoSchema, async data =>
	// TODO: should this take an index value? or should it default to lowest
	useTransaction(tx =>
		tx.insert(todos).values({
			...data,
			id: data.id ?? nanoid(),
			text: data.text,
			userId: useUser(),
			timeCreated: new Date(),
			timeUpdated: new Date(),
			index: data.index
			// index: tx.select({ index: todos.index }).from(todos).where(eq(todos.userId, useUser())).min().add(-1)
		})
	)
)

export const createMany = zod(z.array(insertTodoSchema), async data =>
	useTransaction(tx =>
		tx.insert(todos).values(
			data.map(x => ({
				id: nanoid(),
				timeCreated: new Date(),
				timeUpdated: new Date(),
				userId: useUser(),
				...x
			}))
		)
	)
)

export const update = zod(
	z.object({
		id: Todo.shape.id.array(),
		data: Todo.omit({ id: true }).partial()
	}),
	async ({ id, data }) => {
		console.log('updating id with data', id, data)
		return useTransaction(async tx =>
			tx
				.update(todos)
				.set({
					...data,
					timeUpdated: new Date()
				})
				.where(and(inArray(todos.id, id), eq(todos.userId, useUser())))
		)
	}
)

export const remove = zod(
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
					timeDeleted: new Date()
				})
				.where(and(inArray(todos.id, ids), eq(todos.userId, useUser())))
		)
		// } else {
		// 	return ctx.DB.transaction(async tx => tx.delete(todos).where(inArray(todos.id, ids)))
		// }
	}
)
