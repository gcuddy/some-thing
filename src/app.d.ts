// See https://kit.svelte.dev/docs/types#app

import type { LibSQLDatabase } from 'drizzle-orm/libsql'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			DB: LibSQLDatabase
			// DB: DrizzleD1Database
			user?: {
				id: string
			}
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {
		// 	env: {
		// 		SK_DB: D1Database
		// 	}
		// 	context: {
		// 		waitUntil(promise: Promise<any>): void
		// 	}
		// 	caches: CacheStorage & { default: Cache }
		// }
	}
}

export {}
