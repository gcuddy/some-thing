<script lang="ts">
	import { getContext } from 'svelte'
	import Todo from './Todo.svelte'
	import type { Replicache } from 'replicache'
	import type { Snapshot } from './$types'
	import { afterNavigate } from '$app/navigation'
	import { recents } from '@/components/goto/store'
	import Footer from '@/components/footer.svelte'
	import * as Dialog from '@/components/ui/dialog'
	import NewTodo from '@/components/new-todo.svelte'
	import type { ReplicacheType } from './replicache'
	import { Tray } from 'phosphor-svelte'

	const rep = getContext('__replicache') as ReplicacheType
	console.log({ rep })

	let todo: Todo

	export const snapshot: Snapshot = {
		capture: () => todo.snapshot.capture(),
		restore: data => todo.snapshot.restore(data)
	}

	afterNavigate(() => {
		recents.add('Inbox')
	})

	let newTodoOpen = false
</script>

<div class="mx-auto w-[calc(100%)] grow">
	<!-- <h1>todos</h1> -->
	<Todo bind:this={todo}>
		<div slot="header">
			<div class="flex items-center gap-2">
                <Tray class="h-6 w-6 text-blue-400" weight="duotone" />
                <span class="text-2xl font-semibold tracking-tight"> Inbox </span>
            </div>
		</div>
		<Footer
			slot="footer"
			on:add={async () => {
				// await
				newTodoOpen = true
			}}
		></Footer>
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
					await rep.mutate.todo_create({
						...detail,
						index: sortIndex
					})
				}}
			/>
		</Dialog.Content>
	</Dialog.Root>
</div>
