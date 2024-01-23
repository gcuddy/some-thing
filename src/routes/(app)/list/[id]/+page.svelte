<script lang="ts">
	import ListDetail from '@/components/list-detail.svelte'
	import { ListStore } from '@/data/list'
	export let data

	let list: ReturnType<ReturnType<typeof ListStore.get.watch>>

	$: if (data.replicache)
		list = ListStore.get.watch(
			() => data.replicache!,
			() => [data.id]
		)()
	$: console.log({ $list })
</script>

{#if $list && data.replicache}
	<ListDetail new={false} list={$list} replicache={data.replicache} />
{/if}
