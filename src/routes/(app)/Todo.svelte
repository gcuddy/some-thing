<script lang="ts">
	import { TodoStore } from '$lib/data/todo'
	import type { Replicache } from 'replicache'
	import { getReplicache } from './replicache'
	import { onDestroy } from 'svelte'
	import { page } from '$app/stores'
	import { derived } from 'svelte/store'
	// export let rep: Replicache
	const rep = getReplicache()
	const t = TodoStore.list.watch(
		() => rep,
		() => []
		// (t) => {
		//     return t.filter(t => !t.archivedAt)
		// }
	)()
	const available = derived(t, $t => $t.filter(t => !t.archivedAt))
	const ready = t.ready

	$: filter = $page.url.searchParams.get('filter') || 'all'
	$: allFiltered = $available.every(todo => todo.completed)

	let newTodo = ''
</script>

{#if $ready}
	<div>
		{#if $available.length > 0}
			<button
				on:click={async () => {
					await rep.mutate.todo_update({
						id: $available.map(t => t.id),
						data: {
							completed: !allFiltered
						}
					})
				}}
			>
				Mark all as {allFiltered ? 'un-complete' : 'completed'}
			</button>
		{/if}
		<form
			on:submit|preventDefault={async () => {
				const text = newTodo.trim()
				if (text === '') {
					return
				}
				await rep.mutate.todo_create(text)
				newTodo = ''
			}}
		>
			<input bind:value={newTodo} autofocus type="text" />
			<button>Add</button>
		</form>

		<!-- {JSON.stringify($t)} -->
		{#each $available.filter(todo => {
			if (filter === 'active') return !todo.completed
			if (filter === 'completed') return todo.completed
			return true
		}) as todo}
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
				<a href="/{todo.id}">#</a>
				<button
					on:click={async () => {
						await rep.mutate.todo_delete({
							ids: [todo.id]
						})
					}}>Delete</button
				>
			</div>
		{/each}

		<p>{$available.filter(t => !t.completed).length} items left</p>

		{#each ['All', 'Active', 'Completed'] as filterState}
			<a
				href="/?filter={filterState.toLowerCase()}"
				class={filter === filterState.toLowerCase() ? 'selected' : ''}>{filterState}</a
			>
		{/each}

		<div>
			{#if $available.some(t => t.completed)}
				<button
					on:click={async () => {
						await rep.mutate.todo_delete({
							ids: $available.filter(t => t.completed).map(t => t.id),
							archive: true
						})
					}}
				>
					Clear completed
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.selected {
		outline: 1px solid #ccc;
	}
</style>
