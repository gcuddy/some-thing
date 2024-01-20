// import { drizzle } from 'drizzle-orm/d1'

// export const createDb = (d1: D1Database) => {
// 	return drizzle(d1)
// }

import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'

export function createDb(...args: Parameters<typeof createClient>) {
	const client = createClient(...args)
	const db = drizzle(client, { logger: true })
	return db
}

export type DB = ReturnType<typeof createDb>
