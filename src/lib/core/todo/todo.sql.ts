import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const todos = sqliteTable('todos', {
	id: text('id').primaryKey(),
	text: text('text'),
	completed: integer('completed', { mode: 'timestamp_ms' }),
	archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
	// TODO: ordering

	// user id , etc

	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	version: integer('version')
})

export const user = sqliteTable('user', {
	id: text('id').primaryKey().notNull()
})

export const replicacheClient = sqliteTable('replicache_client', {
	id: integer('id').primaryKey(),
	clientGroupId: text('client_group_id').notNull(),
	lastMutationId: integer('last_mutation_id').notNull(),
	version: integer('version').notNull()
})

export const replicacheServer = sqliteTable('replicache_server', {
	id: integer('id').primaryKey(),
	version: integer('version')
})
