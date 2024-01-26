import { id, timestamps } from '../../util/sql'
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable(
	'user',
	{
		...id,
		...timestamps,
		email: text('email')
	},
	table => ({
		email: uniqueIndex('email').on(table.email)
	})
)
