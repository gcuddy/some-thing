<script lang="ts">
	import ListDetail from '@/components/list-detail.svelte'
	import { ListStore } from '@/data/list'
	import Todo from '../../Todo.svelte'
	import Footer from '@/components/footer.svelte'
	import * as Dialog from '@/components/ui/dialog'
	import NewTodo from '@/components/new-todo.svelte'
	export let data

	let list: ReturnType<ReturnType<typeof ListStore.get.watch>>

	$: if (data.replicache)
		list = ListStore.get.watch(
			() => data.replicache!,
			() => [data.id]
		)()
	$: console.log({ $list })

	let newTodoOpen = false
</script>

{#if $list && data.replicache}
	<Todo
		filterFn={todo => {
			if (todo.listId === data.id) return true
			return false
		}}
	>
		<ListDetail slot="header" new={false} list={$list} replicache={data.replicache} />

		<Footer
			slot="footer"
			on:add={() => {
				newTodoOpen = true
			}}
		/>
	</Todo>
	<Dialog.Root bind:open={newTodoOpen}>
		<Dialog.Overlay />
		<Dialog.Content>
			<NewTodo
				on:submit={async ({ detail }) => {
					newTodoOpen = false
					await data.replicache?.mutate.todo_create({
						...detail,
						listId: data.id
					})
				}}
			/>
		</Dialog.Content>
	</Dialog.Root>
{/if}
