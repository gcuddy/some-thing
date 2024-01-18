import { createDb } from '$lib/core/drizzle'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	if (event.platform?.env?.SK_DB) {
		console.log('creating db')
		console.log(event.platform)
		event.locals.DB = createDb(event.platform?.env?.SK_DB)
	}

	const response = await resolve(event)
	return response
}
