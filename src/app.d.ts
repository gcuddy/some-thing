// See https://kit.svelte.dev/docs/types#app

import type { LibSQLDatabase } from 'drizzle-orm/libsql'

/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import("$lib/server/lucia").Auth;
		type DatabaseUserAttributes = {
			username: string;
		};
		type DatabaseSessionAttributes = {};
	}
}


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
		interface PageData {
			userId: string
		}
		interface PageState {
			selected?: string
		}
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
