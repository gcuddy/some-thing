<script lang="ts">
	import type { LayoutData } from './$types'
	import { setReplicache } from './replicache'
	import '../../app.css'
	import { onDestroy, onMount } from 'svelte'
	import Pusher from 'pusher-js'
	import { PUBLIC_PUSHER_CLUSTER, PUBLIC_PUSHER_KEY } from '$env/static/public'
	export let data: LayoutData

	if (data.replicache) setReplicache(data.replicache)

    let pusherInitialized = false;
    let unsub: () => void;

    function setupPusher() {
        if (!data.replicache) return;
        if (pusherInitialized) return;
        pusherInitialized = true;
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


   $: if (data.replicache) {
        console.log('replicache', data.replicache)
        setupPusher()
    }

	onMount(() => {
		if (!data.replicache) return
        setupPusher()
	})
</script>

{#if data.replicache}
	<slot />
{/if}
