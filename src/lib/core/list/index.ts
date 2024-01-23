import { zod } from '@/util/zod'
import { createSelectSchema } from 'drizzle-zod'
import { lists } from './list.sql'
import { useTransaction } from '@/util/transaction'
import { useUser } from '../user'
import { z } from 'zod'
import { and, inArray } from 'drizzle-orm'

export const List = createSelectSchema(lists, {})
export type List = typeof lists.$inferSelect

export const create = zod(List.partial().required({ name: true }), async data => {
	return useTransaction(tx =>
		tx.insert(lists).values({
			...data,
			userId: useUser(),
			timeCreated: new Date(),
			timeUpdated: new Date()
		})
	)
})

export const update = zod(
	z.object({
		id: List.shape.id.array(),
		data: List.omit({ id: true }).partial()
	}),
	async ({ data, id }) => {
		return useTransaction(tx =>
			tx
				.update(lists)
				.set(data)
				.where(and(inArray(lists.id, id)))
		)
	}
)

export const remove = zod(z.array(List.shape.id), async ids => {
	return useTransaction(tx =>
		tx
			.update(lists)
			.set({
				timeDeleted: new Date()
			})
			.where(inArray(lists.id, ids))
	)
	// return useTransaction(tx => tx.delete(lists).where(inArray(lists.id, ids)))
})
