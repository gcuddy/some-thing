<script lang="ts">
	import type { LayoutData } from './$types'
	import { setReplicache } from './replicache'
	import '../../app.css'
	import { onDestroy, onMount } from 'svelte'
	import { PUBLIC_PUSHER_CLUSTER, PUBLIC_PUSHER_KEY } from '$env/static/public'
	import { PARTYKIT_HOST, PARTYKIT_URL } from './env'
	import { nanoid } from 'nanoid'
	import PartySocket from 'partysocket'
	export let data: LayoutData

	if (data.replicache) setReplicache(data.replicache)

	let pusherInitialized = false
	let unsub: () => void

	let Pusher: typeof import('pusher-js').default

	function setupPusher() {
		if (!data.replicache) return
		if (pusherInitialized) return
		if (!Pusher) return
		pusherInitialized = true
		const pusher = new Pusher(PUBLIC_PUSHER_KEY, {
			cluster: PUBLIC_PUSHER_CLUSTER
		})
		const channel = pusher.subscribe('default')
		console.log({ channel })
		channel.bind('poke', () => {
			console.log('Poked!')
			data.replicache?.pull()
		})
		unsub = () => {
			channel.unbind('poke')
			pusher.unsubscribe('default')
		}
	}

	onDestroy(() => {
		unsub?.()
	})

	$: if (data.replicache && Pusher) {
		console.log('replicache', data.replicache)
		setupPusher()
	}

	onMount(async () => {
		if (!data.replicache) return
		Pusher = (await import('pusher-js')).default
		setupPusher()

		const conn = new PartySocket({
			host: PARTYKIT_HOST,
			room: 'replicache-party'
		})

		conn.addEventListener('message', event => {
            console.log('message', event)
			if (event.data === 'poke') {
				if (!data.replicache) return
				data.replicache.pull()
			}
		})
	})
</script>

{#if data.replicache}
	<slot />
{/if}

<h2>Partykit</h2>
<button
	on:click={async () => {
		await fetch(`${PARTYKIT_URL}/party/${nanoid(10)}`, {
			method: 'POST',
			body: JSON.stringify({}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}}>Party</button
>
