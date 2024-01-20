import { sql } from 'drizzle-orm'
import { integer, text } from 'drizzle-orm/sqlite-core'
import { createId } from './nanoid'

export const cuid = (name: string) => text(name, { length: 16 })

export const id = {
	get id() {
		return cuid('id').primaryKey().notNull().$defaultFn(createId)
	}
}

export const timestamps = {
	timeCreated: integer('time_created', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`strftime('%s', 'now')`),
	timeUpdated: integer('time_updated', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`strftime('%s', 'now')`),
	timeDeleted: integer('time_deleted', { mode: 'timestamp_ms' })
}
