<script lang="ts">
	import PartySocket from 'partysocket'
	import { onMount } from 'svelte'
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

<div class="flex w-full h-full flex-row overflow-hidden items-stretch">
	<aside>test</aside>

	<div class="py-10 flex flex-col flex-1 min-w-0">
		{#if data.replicache}
			<slot />
		{/if}
	</div>
</div>

<style>
	:global(html) {
		height: 100%;
		position: fixed;
		padding: 0;
		margin: 0;
		width: 100%;
	}
	:global(html, body) {
		overflow: hidden;
	}
	:global(body) {
		@apply select-none cursor-default fixed w-full h-full leading-normal;
	}
</style>
