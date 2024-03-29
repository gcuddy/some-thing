import { id, timestamps } from '../../util/sql'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from '../user/user.sql'

export const lists = sqliteTable('lists', {
	...timestamps,
	...id,
	userId: text('user_id').references(() => users.id),
	name: text('name'),
	notes: text('notes'),
	index: integer('index').default(0),
	areaId: text('area_id'),
	type: text('type', {
		enum: ['list', 'project', 'area']
	}).default('project'),
	shared: text('shared', {
		enum: ['private', 'public', 'shared']
	}).default('private')
})

// TODO: figure out list permissions for public/private
// Options: private, to user. public, to everyone. shared, to specific users
