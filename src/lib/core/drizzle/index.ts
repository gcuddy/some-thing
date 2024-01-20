// import { drizzle } from 'drizzle-orm/d1'

// export const createDb = (d1: D1Database) => {
// 	return drizzle(d1)
// }

import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { VITE_TURSO_DB_AUTH_TOKEN, VITE_TURSO_DB_URL } from '$env/static/private'

export function createDb(...args: Parameters<typeof createClient>) {
	const client = createClient(...args)
	const db = drizzle(client)
	return db
}
