import { createDb } from '$lib/core/drizzle'
import type { Handle } from '@sveltejs/kit'
import { VITE_TURSO_DB_AUTH_TOKEN, VITE_TURSO_DB_URL } from '$env/static/private'

export const handle: Handle = async ({ event, resolve }) => {
	// if (event.platform?.env?.SK_DB) {
	// 	console.log('creating db')
	// 	console.log(event.platform)
	// }
	// hm
	event.locals.DB = createDb({
		url: VITE_TURSO_DB_URL,
		authToken: VITE_TURSO_DB_AUTH_TOKEN
	})
	let userID = event.cookies.get('userID')
	if (!userID) {
		userID = crypto.randomUUID()
		event.cookies.set('userID', userID, {
			path: '/'
		})
	}
	if (userID) event.locals.user = { id: userID }

	const response = await resolve(event)
	return response
}
