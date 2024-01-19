import type { LibSQLDatabase } from 'drizzle-orm/libsql'

export type Ctx = {
	DB: LibSQLDatabase
	user: {
		id: string
	}
	version: number
}
