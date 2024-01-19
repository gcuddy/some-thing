import { PUSHER_SECRET } from '$env/static/private'
import { PUBLIC_PUSHER_APP_ID, PUBLIC_PUSHER_CLUSTER, PUBLIC_PUSHER_KEY } from '$env/static/public'

export async function poke() {
	const url = `https://api-${PUBLIC_PUSHER_CLUSTER}.pusher.com/apps/${PUBLIC_PUSHER_APP_ID}/events`

	const body = JSON.stringify({
		name: 'poke',
		data: {}
	})

	const ts = Math.floor(Date.now() / 1000)
	const path = `/apps/${PUBLIC_PUSHER_APP_ID}/events`

	const bodyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
	console.log({ bodyHash })
	const bodyHashHex = Array.from(new Uint8Array(bodyHash))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')

	console.log({ bodyHashHex })
	const auth = `key=${PUBLIC_PUSHER_KEY}&timestamp=${ts}&body_md5=${bodyHashHex}`

	console.log({ auth })

	console.log('hey')
	const signature = await crypto.subtle.sign(
		{ name: 'HMAC' },
		await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(PUSHER_SECRET),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		),
		new TextEncoder().encode(auth)
	)

	console.log({ signature })

	const signatureHex = Array.from(new Uint8Array(signature))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('')

	console.log({ signatureHex })

	const headers = {
		'Content-Type': 'application/json',
		'X-Pusher-Key': PUBLIC_PUSHER_KEY,
		'X-Pusher-Signature': signatureHex,
		'X-Pusher-Timestamp': ts.toString()
	}

	const res = await fetch(url, {
		method: 'POST',
		headers,
		body
	})

	console.log(res)

	return res
}
