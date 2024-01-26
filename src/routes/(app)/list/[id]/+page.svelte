<script lang="ts">
	import ListDetail from '@/components/list-detail.svelte'
	import { ListStore } from '@/data/list'
	import Todo from '../../Todo.svelte'
	import Footer from '@/components/footer.svelte'
	import * as Dialog from '@/components/ui/dialog'
	import NewTodo from '@/components/new-todo.svelte'
	import { page } from '$app/stores'
	import { afterNavigate, replaceState } from '$app/navigation'
	import { sleep } from '@/util/sleep'
	import { recents } from '@/components/goto/store'
	export let data

    $: console.log({data})

	let list: ReturnType<ReturnType<typeof ListStore.get.watch>>

	$: if (data.replicache)
		list = ListStore.get.watch(
			() => data.replicache!,
			() => [data.id]
		)()
	$: console.log({ $list })

	let newTodoOpen = false

	let todo: Todo

	$: if ($list && data.replicache && $page.url.searchParams.has('task')) {
		const id = $page.url.searchParams.get('task')
		sleep(100).then(() => {
			if (id && todo) {
				console.log({ id })
				todo.scrollToTodo(id)
				// todo?.scrollToTodo(id)
				// delete from params
				// replaceState('', {})
			}
		})
	}

	$: if ($list) {
		recents.add({
			type: 'list',
			data: $list
		})
	}

	// afterNavigate(() => {
	// 	console.log('AFTER NAVIGATE')
	// 	if ($list) {
	// 		recents.add({
	// 			type: 'list',
	// 			data: $list
	// 		})
	// 		console.log({ $recents })
	// 	}
	// })
</script>



{#if $list && data.replicache}
	<Todo
		bind:this={todo}
		filterFn={todo => {
			if (todo.listId === data.id) return true
			return false
		}}
	>
		<ListDetail slot="header" list={$list} replicache={data.replicache} />


		<Footer
			slot="footer"
			on:add={() => {
				newTodoOpen = true
			}}
		/>
	</Todo>
	<Dialog.Root openFocus={"[data-todo-input]"} bind:open={newTodoOpen}>
		<Dialog.Overlay />
		<Dialog.Content >
			<NewTodo
				on:submit={async ({ detail }) => {
					newTodoOpen = false
					let sortIndex = -100
					if (todo) {
						sortIndex = todo.getMinIndex() - 100
					}
					console.log({ sortIndex })
					await data.replicache?.mutate.todo_create({
						...detail,
						index: sortIndex,
						listId: data.id
					})
				}}
			/>
		</Dialog.Content>
	</Dialog.Root>
{/if}
