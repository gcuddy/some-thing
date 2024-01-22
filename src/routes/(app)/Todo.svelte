<script lang="ts">
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from './replicache'
	import { page } from '$app/stores'
	import { derived } from 'svelte/store'
	import VisuallyHidden from '$lib/components/visually-hidden.svelte'
	import { NoteBlank } from 'phosphor-svelte'
	import TodoDetail from './task/[id]/+page.svelte'
	import { flip } from 'svelte/animate'
	import { cubicInOut } from 'svelte/easing'
	import {
		createKeyboardNavigator,
		setKeyboardNavigatorContext
	} from '$lib/actions/keyboard-navigator'
	import type { Snapshot } from './$types'
	import { goto, preloadData, pushState } from '$app/navigation'
	import * as Dialog from '$lib/components/ui/dialog'
	import { fade, fly, scale } from 'svelte/transition'
	import { processTasksFromText } from '@/util/text'
	import { distributeItems } from '@/util/number'
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
	const available = derived(t, $t =>
		$t
			.filter(t => !t.archivedAt)
			.sort((a, b) => {
				const aIndex = a.index ?? 0
				const bIndex = b.index ?? 0
				if (aIndex === bIndex) return 0
				return aIndex > bIndex ? 1 : -1
			})
	)
	const ready = t.ready

	let editing: null | string = null

	$: filter = $page.url.searchParams.get('filter') || 'all'
	$: allFiltered = $available.every(todo => todo.completed)
	$: dialogOpen =
		'selected' in $page.state && $page.state.selected && typeof $page.state.selected === 'string'
			? true
			: false

	let newTodo = ''

	function handleKeydown(e: KeyboardEvent) {}

	let initialFocusId: string | null = null

	export const snapshot: Snapshot = {
		capture() {
			const focused = navigator.focused
			console.log({ focused })
			if (focused) {
				return focused.dataset.todoId ?? null
			}
		},
		restore(id: string) {
			console.log({ id })
			if (id) {
				initialFocusId = id
			}
		}
	}

	let ul: HTMLUListElement

	$: if (initialFocusId && ul) {
		const el = ul.querySelector(`li[data-todo-id="${initialFocusId}"]`)
		console.log({ el })
		if (el instanceof HTMLElement) {
			navigator.focus(el)
		}
		initialFocusId = null
	}

	const navigator = createKeyboardNavigator({
		target: "li[data-element='todo']",
		onSelect: el => el.querySelector('a')?.click(),
		disable: () => {
			if (dialogOpen) return true
			if ($page.params.id) return true
			console.log('disable - false')
			return false
		},
		onDelete: async els => {
			await rep.mutate.todo_delete({
				ids: els.map(el => el.dataset.todoId!),
				archive: true
			})
		},
		onKeydown: async (e, { focused, selected }) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				const id = selected.length
					? selected.map(el => el.dataset.todoId!)
					: [focused.dataset.todoId!]
				const els = selected.length ? selected : [focused]
				console.log({ id, selected })
				const allCompleted = els.every(el => Boolean(el.dataset.completed))
				console.log({ allCompleted })
				if (allCompleted) {
					await rep.mutate.todo_update({
						id,
						data: {
							completed: null
						}
					})
				} else {
					// get uncompleted
					const uncompleted = els.filter(el => !Boolean(el.dataset.completed))
					const id = uncompleted.map(el => el.dataset.todoId!)
					await rep.mutate.todo_update({
						id,
						data: {
							completed: new Date()
						}
					})
				}
				return true
			}
		}
	})
	setKeyboardNavigatorContext(navigator)
</script>

<svelte:window
	on:keydown={handleKeydown}
	on:paste={async e => {
		console.log('paste')
		const text = e.clipboardData?.getData('text/plain')?.trim()
		if (text) {
			// process
			const tasks = processTasksFromText(text)
			if (!tasks.length) return
			const f = navigator.focused?.dataset.todoId
			if (!f) {
				// then we're at the top - insert at the top
				const minIndex = $available[0]?.index ?? 0
				const index = minIndex - 1000
				const distribution = distributeItems(index, minIndex, tasks.length)
				console.log({ distribution })
				const data = tasks.map((task, i) => {
					return {
						text: task,
						index: distribution[i]
					}
				})
				console.log({ data })
				return await rep.mutate.todo_createmany(data)
			}
			const currentIndex = f ? $available.findIndex(t => t.id === f) : 0
			const minIndex = f ? $available.findIndex(t => t.id === f) : $available[0]?.index ?? 0
			const maxIndex =
				currentIndex + 1 < $available.length ? $available[currentIndex + 1].index ?? 0 : 1000

			if (maxIndex - minIndex < tasks.length) {
				// then we're f**ked - we need to shift indexes
				// TODO
				console.log('TODO - shift indexes')
			}

			const distribution = distributeItems(minIndex, maxIndex, tasks.length)
			console.log({ distribution })
			const data = tasks.map((task, i) => {
				return {
					text: task,
					index: distribution[i]
				}
			})
			console.log({ data })
			return await rep.mutate.todo_createmany(data)
			//    const maxIndex =
			// try to find the first index that is not taken
		}
	}}
/>
{#if $ready}
	<div class="overflow-y-auto">
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
					console.log({ $available })
					const minIndex = $available[0]?.index ?? 0
					console.log({ minIndex })
					const index = minIndex - 100
					console.log({ index })
					await rep.mutate.todo_create({ text, index })
					newTodo = ''
				}}
			>
				<input placeholder="What needs to be done?" bind:value={newTodo} type="text" />
				<!-- <button>Add</button> -->
			</form>
		</div>

		<!-- {JSON.stringify($t)} -->
		<ul bind:this={ul}>
			{#each $available.filter(todo => {
				if (filter === 'active') return !todo.completed
				if (filter === 'completed') return todo.completed
				return true
			}) as todo (todo.id)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li
					on:click={e => {
						// if (e.target instanceof HTMLInputElement) {
						// 	return
						// }
						if (e.shiftKey) {
							navigator.selectAdjacent(e.currentTarget)
						} else {
							navigator.focus(e.currentTarget)
						}
					}}
					data-element="todo"
					data-todo-id={todo.id}
					data-completed={todo.completed ? 'true' : undefined}
					class="rounded px-2 py-1 data-[focus=true]:bg-blue-200 data-[selected=true]:bg-blue-100"
					animate:flip={{
						duration: 150,
						easing: cubicInOut
					}}
				>
					<div class="flex items-center gap-2.5">
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
							class="transition active:scale-105"
						/>
						<a
							class="flex cursor-default items-center"
							href="/task/{todo.id}"
							on:click={async e => {
								// if opening new tab or screen is too small, bail
								if (e.metaKey || e.ctrlKey || innerWidth < 640) return
								e.preventDefault()

								const { href } = e.currentTarget

								// run `load` functions (or rather, get the result of the `load` functions
								// that are already running because of `data-sveltekit-preload-data`)
								const result = await preloadData(href)

								if (result.type === 'loaded' && result.status === 200) {
									pushState(href, { selected: result.data.id })
								} else {
									goto(href)
								}
							}}
						>
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
									on:dblclick|stopPropagation|preventDefault={() => {
										// editing
										editing = todo.id
									}}>{todo.text}</span
								>
							{/if}

							{#if !!todo.notes}
								<NoteBlank weight="light" class="ml-1.5 h-3.5 w-3.5 text-gray-600" />
							{/if}
						</a>
					</div>
					<!-- <a href="/task/{todo.id}">#</a>
					<button
						on:click={async () => {
							await rep.mutate.todo_delete({
								ids: [todo.id]
							})
						}}>Delete</button
					> -->
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

<Dialog.Root
	open={dialogOpen}
	onOpenChange={open => {
		if (!open) {
			history.back()
		}
	}}
	openFocus={'[data-todo-input]'}
>
	<!-- Move to provider -->
	<Dialog.Content class="p-1">
		<TodoDetail
			on:submit={() => {
				console.log('submit')
				history.back()
			}}
			data={{
				replicache: rep,
				id: $page.state.selected
			}}
		/>
	</Dialog.Content>
</Dialog.Root>

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
