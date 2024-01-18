import { createDb } from '$lib/core/drizzle'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	if (event.platform?.env?.SK_DB) {
		console.log('creating db')
		console.log(event.platform)
		event.locals.DB = createDb(event.platform?.env?.SK_DB)
	}
	const userID = event.cookies.get('userID')
	if (userID) event.locals.user = { id: userID }

	const response = await resolve(event)
	return response
	return response
}
