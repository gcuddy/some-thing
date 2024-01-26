// src/lib/server/lucia.ts
import { lucia } from 'lucia'
import { sveltekit } from 'lucia/middleware'
import { dev } from '$app/environment'
import { libsql } from '@lucia-auth/adapter-sqlite'
import { createDb } from '../drizzle'

// const db = createDb

// export const auth = lucia({
// 	adapter: libsql(db, {
//         user: "user",
//     }),
// 	env: dev ? 'DEV' : 'PROD',
// 	middleware: sveltekit(),

// 	getUserAttributes: data => {
// 		return {
// 			githubUsername: data.username
// 		}
// 	}
// })

// export type Auth = typeof auth
