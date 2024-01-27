<script lang="ts">
	import Sidebar from '$lib/components/sidebar.svelte'
	import Goto from '@/components/goto/goto.svelte'
	import { ModeWatcher } from 'mode-watcher'
	import PartySocket from 'partysocket'
	import type { LayoutData } from './$types'
	import { PARTYKIT_HOST } from './env'
	import { setReplicache } from './replicache'

	import { gotoOpen } from '@/stores/goto'
	import { onDestroy } from 'svelte'
	export let data: LayoutData

	if (data.replicache) setReplicache(data.replicache)

	let conn: PartySocket | null = null

	const handleMessage = (event: MessageEvent) => {
		console.log('message', event)
		if (event.data === 'poke') {
			if (!data.replicache) return
			data.replicache.pull()
		}
	}

	// handle changing data user Id
	$: if (data.userId) {
		console.log('setting up party socket with user id ', data.userId)
		if (conn) {
			conn.removeEventListener('message', handleMessage)
			conn.close()
		}

		conn = new PartySocket({
			host: PARTYKIT_HOST,
			room: data.userId
		})

		conn.addEventListener('message', handleMessage)
	}

    // not sure this is necessary but let's make sure it's dead
	onDestroy(() => {
		if (conn) {
			conn.removeEventListener('message', handleMessage)
			conn.close()
		}
	})
</script>

<ModeWatcher />

<!-- recreate app on userId change -->
{#if data.replicache}
{#key data.userId}
	<div class="flex h-full w-full flex-row items-stretch overflow-hidden">
		<aside class="w-60 max-sm:hidden">
			{#if data.replicache}
				<Sidebar rep={data.replicache} />
			{/if}
		</aside>

		<div class="flex min-w-0 flex-1 flex-col pt-10">
			{#if data.replicache}
				<slot />
			{/if}
		</div>
	</div>
{/key}
{:else}
<p>Loading...</p>
{/if}
{#if data.replicache}
	<Goto bind:open={$gotoOpen} rep={data.replicache} />
{/if}

<style lang="postcss">
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
		@apply fixed h-full w-full cursor-default select-none leading-normal;
	}
</style>
