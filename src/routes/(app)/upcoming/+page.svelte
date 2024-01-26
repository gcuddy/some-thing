<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { recents } from '@/components/goto/store'
	import type { Replicache } from 'replicache'
	import { getContext } from 'svelte'
	import Todo from '../Todo.svelte'
	import type { Snapshot } from './$types'
	import { filterFn } from './filter'
	import * as Dialog from '@/components/ui/dialog'
	import NewTodo from '@/components/new-todo.svelte'
	import type { ReplicacheType } from '../replicache'
	import Footer from '@/components/footer.svelte'
	import { Calendar } from 'phosphor-svelte'

	const rep = getContext('__replicache') as ReplicacheType
	console.log({ rep })

	let todo: Todo
	let newTodoOpen = false

	export const snapshot: Snapshot = {
		capture: () => todo.snapshot.capture(),
		restore: data => todo.snapshot.restore(data)
	}

	afterNavigate(() => {
		recents.add('Upcoming')
	})
</script>

<div class="mx-auto w-[calc(100%)] grow">
	<!-- <h1>todos</h1> -->
	<Todo bind:this={todo} {filterFn}>
		<div slot="header">
			<div class="flex items-center gap-2">
				<Calendar class="h-6 w-6 text-red-400" weight="duotone" />
				<span class="text-2xl font-semibold tracking-tight"> Upcoming </span>
			</div>
		</div>
		<Footer
			slot="footer"
			on:add={() => {
				newTodoOpen = true
			}}
		/>
	</Todo>

	<Dialog.Root openFocus={'[data-todo-input]'} bind:open={newTodoOpen}>
		<Dialog.Overlay />
		<Dialog.Content>
			<NewTodo
				on:submit={async ({ detail }) => {
					newTodoOpen = false
					let sortIndex = -100
					if (todo) {
						sortIndex = todo.getMinIndex() - 100
					}
					console.log({ sortIndex })
					await rep?.mutate.todo_create({
						...detail,
						index: sortIndex
					})
				}}
			/>
		</Dialog.Content>
	</Dialog.Root>
</div>
