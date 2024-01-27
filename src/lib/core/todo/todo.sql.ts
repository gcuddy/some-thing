import { timestamps } from '../../util/sql'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { lists } from '../list/list.sql'
import { users } from '../user/user.sql'

export const todos = sqliteTable('todos', {
	...timestamps,
	id: text('id').primaryKey(),
	text: text('text'),
	completed: integer('completed', { mode: 'timestamp_ms' }),
	archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
	notes: text('notes'),

	index: integer('index').default(0),

	startDate: integer('start_date', { mode: 'timestamp_ms' }),

	// TODO: parent
	// TODO: tags

	// TODO: checklist
	// TODO: ordering

	// user id , etc

	userId: text('user_id')
		.notNull()
		.references(() => users.id),

	version: integer('version'),

	listId: text('list_id').references(() => lists.id)
})
