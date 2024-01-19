import { poke } from '$lib/util/pusher'

export async function GET() {
	await poke()

	return new Response('OK')
}
