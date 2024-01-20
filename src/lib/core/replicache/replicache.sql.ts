import { timestamps } from '$lib/util/sql'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const replicacheClient = sqliteTable('replicache_client', {
	...timestamps,
	id: text('id', { length: 36 }).primaryKey(),
	clientGroupId: text('client_group_id', { length: 36 }).notNull(),
	mutationId: integer('last_mutation_id').notNull().default(0),
	clientVersion: integer('client_version').notNull()
})

export const replicacheServer = sqliteTable('replicache_server', {
	id: integer('id').primaryKey(),
	version: integer('version')
})

export const replicacheClientGroup = sqliteTable('replicache_client_group', {
	...timestamps,
	id: text('id', { length: 36 }).primaryKey(),
	//    TODO: maybe "actor" model from sst-console?
	userID: text('user_id', { length: 16 }).notNull(),
	cvrVersion: integer('cvr_version'),
	clientVersion: integer('client_version').notNull()
})

export const replicacheCvr = sqliteTable(
	'replicache_cvr',
	{
		...timestamps,
		// workspcae id?
		data: text('data', { mode: 'json' }).$type<Record<string, number>>().notNull(),
		id: integer('id').notNull(),
		clientGroupID: text('client_group_id', { length: 36 }).notNull(),
		clientVersion: integer('client_version').notNull()
	},
	table => ({
		primary: primaryKey({
			columns: [table.clientGroupID, table.id]
		})
	})
)
