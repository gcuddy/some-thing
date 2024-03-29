import { json } from '@sveltejs/kit'
import { PARTYKIT_URL } from '../../(app)/env'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ fetch, url, request, cookies }) => {
	// this is a proxy for partykit

	// TODO: auth
	try {
		const isPush = url.searchParams.get('push') !== null
		const isPull = url.searchParams.get('pull') !== null

		const data = await request.json()
		console.log({ data, url: url.toString() })

		const userId = cookies.get('userId')
		console.log({ userId })

		if (!userId) {
			return new Response('Unauthorized', { status: 401 })
		}

		const res = await fetch(`${PARTYKIT_URL}/parties/main/${userId}?${isPush ? 'push' : 'pull'}`, {
			method: 'POST',
			// this seems... wasteful??
			body: JSON.stringify(data),
			headers: {
				// TODO: auth
				'content-type': 'application/json',
				'x-user-id': userId
			}
		})
		console.log('got res', JSON.stringify(res, null, 2))

		const ret = await res.json()
		console.log({ url: url.toString(), ret })

		return json(ret)
	} catch (e) {
		console.error(e)
		return new Response('Internal Server Error', { status: 500 })
	}
}
