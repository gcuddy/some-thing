<script lang="ts">
	import PartySocket from 'partysocket'
	import { onMount } from 'svelte'
	import '../../app.css'
	import type { LayoutData } from './$types'
	import { PARTYKIT_HOST } from './env'
	import { setReplicache } from './replicache'
	import Sidebar from '$lib/components/sidebar.svelte'
	import Goto from '@/components/goto.svelte'
	export let data: LayoutData

	if (data.replicache) setReplicache(data.replicache)

    $: if (data.replicache) {
        data.replicache.subscribe(async tx => {
            return await tx.scan().entries().toArray()
        }, {
            onData: (e) => {
                console.log('onData', e)

            }
        })
    }

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
{#if data.replicache}
    <Goto rep={data.replicache} />
{/if}


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
		@apply fixed h-full w-full cursor-default select-none leading-normal;
	}
</style>
