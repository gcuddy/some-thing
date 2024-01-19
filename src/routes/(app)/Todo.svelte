<script lang="ts">
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from './replicache'
	import { page } from '$app/stores'
	import { derived } from 'svelte/store'
	import VisuallyHidden from '$lib/components/visually-hidden.svelte'
	// export let rep: Replicache
	const rep = getReplicache()
	const t = TodoStore.list.watch(
		() => rep,
		() => []
		// (t) => {
		//     return t.filter(t => !t.archivedAt)
		// }
	)()
	$: console.log({ $t })
	const available = derived(t, $t => $t.filter(t => !t.archivedAt))
	const ready = t.ready

	let editing: null | string = null

	$: filter = $page.url.searchParams.get('filter') || 'all'
	$: allFiltered = $available.every(todo => todo.completed)

	let newTodo = ''
</script>

{#if $ready}
	<div>
		<div class="header">
			<button
				disabled={!$available.length}
				on:click={async () => {
					await rep.mutate.todo_update({
						id: $available.map(t => t.id),
						data: {
							completed: !allFiltered ? new Date() : null
						}
					})
				}}
			>
				{#if allFiltered}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="#000000"
						viewBox="0 0 256 256"
						><path
							d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"
						></path></svg
					>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="#000000"
						viewBox="0 0 256 256"
						><path
							d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
						></path></svg
					>
				{/if}
				<VisuallyHidden>Mark all as {allFiltered ? 'un-complete' : 'completed'}</VisuallyHidden>
			</button>
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
				<input placeholder="What needs to be done?" bind:value={newTodo} autofocus type="text" />
				<!-- <button>Add</button> -->
			</form>
		</div>

		<!-- {JSON.stringify($t)} -->
		<ul>
			{#each $available.filter(todo => {
				if (filter === 'active') return !todo.completed
				if (filter === 'completed') return todo.completed
				return true
			}) as todo}
				<li>
					<input
						on:change={async e => {
							if (e.target instanceof HTMLInputElement) {
								await rep.mutate.todo_update({
									id: [todo.id],
									data: {
										completed: Boolean(e.target.checked) ? new Date() : null
									}
								})
							}
						}}
						type="checkbox"
						checked={!!todo.completed}
					/>
					{#if editing === todo.id}
						<!-- svelte-ignore a11y-autofocus -->
						<input
							on:keydown={e => {
								if (e.target instanceof HTMLInputElement) {
									if (e.key === 'Enter') {
										e.target.blur()
									} else if (e.key === 'Escape') {
										editing = null
									}
								}
							}}
							on:blur={async e => {
								if (e.target instanceof HTMLInputElement) {
									await rep.mutate.todo_update({
										id: [todo.id],
										data: {
											text: e.target.value
										}
									})
									editing = null
								}
							}}
							type="text"
							value={todo.text}
							class="edit"
							autofocus
						/>
					{:else}
						<span
							class:done={todo.completed}
							role="listitem"
							on:dblclick={() => {
								// editing
								editing = todo.id
							}}>{todo.text}</span
						>
					{/if}

					<a href="/{todo.id}">#</a>
					<button
						on:click={async () => {
							await rep.mutate.todo_delete({
								ids: [todo.id]
							})
						}}>Delete</button
					>
				</li>
			{/each}
		</ul>

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

	.header {
		display: flex;
		flex-direction: row;
	}

	.header form {
		display: flex;
		flex: 1;
		flex-direction: row;
	}

	ul {
		list-style: none;
		padding: 0;
	}
	ul li {
		display: flex;
		align-items: center;
	}
	ul li span.done {
		text-decoration: line-through;
		opacity: 0.5;
	}
	ul li span,
	ul li .edit {
		flex: 1;
		font-size: 1rem;
		font-family: Inter, sans-serif;
	}

	.header input {
		flex: 1;
		font-size: 1.4rem;
		padding: 16px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>
