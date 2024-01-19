import { createDb } from '$lib/core/drizzle'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	// if (event.platform?.env?.SK_DB) {
	// 	console.log('creating db')
	// 	console.log(event.platform)
	// }
	// hm
	event.locals.DB = createDb()
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
