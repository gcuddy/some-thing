import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const replicacheClient = sqliteTable('replicache_client', {
	id: text('id').primaryKey(),
	clientGroupId: text('client_group_id').notNull(),
	lastMutationId: integer('last_mutation_id').notNull(),
	version: integer('version').notNull()
})

export const replicacheServer = sqliteTable('replicache_server', {
	id: integer('id').primaryKey(),
	version: integer('version')
})

export const replicacheClientGroup = sqliteTable('replicache_client_group', {
	id: text('id').primaryKey(),
	userID: text('user_id').notNull()
})
