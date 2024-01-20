<script lang="ts">
	import PartySocket from 'partysocket'
	import { onDestroy, onMount } from 'svelte'
	import '../../app.css'
	import type { LayoutData } from './$types'
	import { PARTYKIT_HOST } from './env'
	import { setReplicache } from './replicache'
	export let data: LayoutData

	if (data.replicache) setReplicache(data.replicache)

	onMount(() => {
		if (!data.replicache) return

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

		return () => {
			conn.close()
		}
	})
</script>

{#if data.replicache}
	<slot />
{/if}
