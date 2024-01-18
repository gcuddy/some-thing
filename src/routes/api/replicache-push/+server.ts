import type { PushRequestV1 } from 'replicache'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ url, platform, request }) => {
	const push: PushRequestV1 = await request.json()
	console.log('processing push', JSON.stringify(push))

	const t0 = Date.now()

	try {
		for (const mutation of push.mutations) {
		}
	} catch (e) {
		console.error(e)
	}
}
