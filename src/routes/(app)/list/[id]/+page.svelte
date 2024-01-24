<script lang="ts">
	import ListDetail from '@/components/list-detail.svelte'
	import { ListStore } from '@/data/list'
	import Todo from '../../Todo.svelte'
	import Footer from '@/components/footer.svelte'
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
	<Todo
		filterFn={todo => {
			if (todo.listId === data.id) return true
			return false
		}}
	>
		<ListDetail slot="header" new={false} list={$list} replicache={data.replicache} />

		<Footer slot="footer" />
	</Todo>
{/if}
