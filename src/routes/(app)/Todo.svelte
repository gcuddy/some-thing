<script lang="ts">
	import { TodoStore } from '$lib/data/todo'
	import type { Replicache } from 'replicache'
	import { getReplicache } from './replicache'
	import { onDestroy } from 'svelte'
	// export let rep: Replicache
	const rep = getReplicache()
	const t = TodoStore.list.watch(
		() => rep,
		() => []
	)()
	const ready = t.ready
	console.log({ ready })

	// let unsub: () => void
	// $: {
	// 	unsub?.()
	// 	rep.subscribe(
	// 		async tx => {
	// 			const todos = await tx.scan({ prefix: '/todo/' }).values().toArray()
	// 			// const ids = await tx.scan().entries().toArray()
	// 			console.log({ todos })
	// 			return todos
	// 			// return [todos, ids]
	// 		},
	// 		data => {
	// 			console.log('onData', data)
	// 		}
	// 		// { scan: { prefix: 'todo/' } },
	// 	)
	// }
	// onDestroy(() => {
	// 	unsub?.()
	// })
	// rep.subscribe(async tx => {
	//     const todos = await tx.scan({prefix: 'todo/'})
	//     console.log({ todos })
	// })
	// const s = TodoStore.list()
	// console.log({ s })

	let newTodo = ''
</script>

{$ready}
<form
	on:submit|preventDefault={async () => {
		await rep.mutate.todo_create(newTodo)
		newTodo = ''
	}}
>
	<input bind:value={newTodo} type="text" />
	<button>Add</button>
</form>

{JSON.stringify($t)}
{#each $t as todo}
	<div>
		<input
			on:change={async e => {
				if (e.target instanceof HTMLInputElement) {
					await rep.mutate.todo_update({
						id: [todo.id],
						data: {
							completed: Boolean(e.target.checked)
						}
					})
				}
			}}
			type="checkbox"
			checked={todo.completed}
		/>
		{todo.text}
	</div>
{/each}
