<script lang="ts">
	import ListDetail from '@/components/list-detail.svelte'
	export let data

	$: list = data.list
</script>

{#if $list && data.replicache}
	<ListDetail new={false} list={$list} replicache={data.replicache} />
{/if}
