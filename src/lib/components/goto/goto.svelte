<script lang="ts">
	import { goto } from '$app/navigation'
	import * as Command from '$lib/components/ui/command'
	import { ListStore } from '@/data/list'
	import { TodoStore } from '@/data/todo'
	import commandScore from 'command-score'
	import { Circle, Cube, ListChecks } from 'phosphor-svelte'
	import { onMount, tick } from 'svelte'
	import { type ReplicacheType } from '../../../routes/(app)/replicache'
	import { specials } from './data'
	import { recents } from './store'
	import type { ListItem, SpecialListItem, TodoItem } from './types'

	export let open = false
	let searchValue = ''

	export let rep: ReplicacheType

	$: if (!open) {
		tick().then(() => {
			searchValue = ''
		})
	}

	const todos = TodoStore.list.watch(
		() => rep,
		() => []
	)()
	const lists = ListStore.list.watch(
		() => rep,
		() => []
	)()

	function handleSearch(searchValue: string) {
		const _todos: Array<TodoItem & { score: number }> = []
		const _lists: Array<(SpecialListItem & { score: number }) | (ListItem & { score: number })> = []

		for (const todo of $todos) {
			if (!todo.text) continue
			const score = commandScore(todo.text, searchValue)
			console.log({ score, todo, searchValue })
			if (score > 0) {
				_todos.push({
					type: 'todo',
					data: todo,
					score
				})
			}
		}

		for (const special of specials) {
			if (!special.data.name) continue
			// get max score of keywords
			const score = special.data.keywords.reduce((acc, keyword) => {
				const _score = commandScore(keyword, searchValue)
				if (_score > acc) return _score
				return acc
			}, 0)
			// const score = commandScore(special.data.name, searchValue)
			if (score > 0) {
				_lists.push({
					type: 'special',
					data: special.data,
					score
				})
			}
		}

		for (const list of $lists) {
			if (!list.name) continue
			const score = commandScore(list.name, searchValue)
			if (score > 0) {
				_lists.push({
					type: 'list',
					data: list,
					score
				})
			}
		}

		console.log(_todos, _lists)

		return {
			todos: _todos.sort((a, b) => b.score - a.score),
			lists: _lists.sort((a, b) => b.score - a.score)
		}
	}

	let results: ReturnType<typeof handleSearch> = {
		todos: [],
		lists: []
	}

	$: if (searchValue) results = handleSearch(searchValue)

	function check(): boolean {
		const popover = document.querySelector('[data-melt-popover-content]')
		if (popover) return false
		const datePicker = document.querySelector<HTMLDivElement>('[data-date-picker]')
		if (datePicker) return false
		const dialog = document.querySelector<HTMLDivElement>('[data-dialog]')
		if (dialog) {
			const cmd = dialog.querySelector('[data-cmdk-root]')
			if (!cmd) return false
		}

		if (document.activeElement?.tagName === 'TEXTAREA') return false
		if (
			document.activeElement?.tagName === 'INPUT' &&
			(document.activeElement as HTMLInputElement).type === 'text'
		)
			return false

		return true
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			const valid = check()
			if (!valid) return
			if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault()
				open = !open
			}
			if (e.metaKey || e.ctrlKey || e.altKey) return
			// if alphanumeric character
			if (e.key.length === 1 && e.key.match(/^[0-9a-zA-Z]+$/)) {
				// searchValue = e.key
				e.preventDefault()
				open = !open
				tick().then(() => {
					searchValue = e.key
					const input = document.querySelector<HTMLInputElement>('[data-cmdk-input]')
					if (input) {
						input.focus()
						input.setSelectionRange(1, 1)
					}
				})
			}
			// if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
			// 	e.preventDefault()
			// 	open = !open
			// }
		}
		document.addEventListener('keydown', handleKeydown)
		return () => {
			document.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<Command.Dialog
	dialogClass="max-w-sm"
	class="bg-gray-100 p-1.5 dark:bg-gray-800"
	bind:open
	openFocus={null}
	shouldFilter={false}
>
	<Command.Input
		wrapperClass="text-foreground"
		bind:value={searchValue}
		autofocus
		placeholder="Quick Find"
	/>
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		{#if (!searchValue && $recents.length) || results.lists.length}
			<Command.Group heading={searchValue ? 'Lists' : 'Recents'}>
				{#each !searchValue ? $recents : results.lists as list}
					<Command.Item
						class="aria-selected:bg-accent/75 aria-selected:text-foreground"
						onSelect={async () => {
							open = false
							if ('fn' in list.data && list.data.fn) {
								list.data.fn()
							} else if ('href' in list.data) {
								await goto(list.data.href)
							} else {
								await goto(`/list/${list.data.id}`)
							}
						}}
						value={list.data.id}
					>
						{#if list.type === 'special'}
							<svelte:component
								this={list.data.icon}
								class="mr-1.5 h-4 w-4 {list.data.iconClass}"
								{...list.data.iconProps}
							/>
						{:else if list.data.type === 'project'}
							<!-- TODO: completed anduncompleted list -->
							<Circle class="mr-1.5 h-4 w-4 text-accent" />
						{:else if list.data.type === 'area'}
							<Cube class="mr-1.5 h-4 w-4 text-emerald-500" />
						{:else if list.data.type === 'list'}
							<ListChecks class="mr-1.5 h-4 w-4 text-rose-400" />
						{/if}
						{list.data.name}</Command.Item
					>
				{/each}
			</Command.Group>
		{/if}
		{#if searchValue && results.todos.length}
			<Command.Group heading="Todos">
				{#each results.todos as todo}
					<Command.Item
						onSelect={async () => {
							// TODO: show in context
							if (todo.data.listId) {
								open = false
								await goto(`/list/${todo.data.listId}?task=${todo.data.id}`)
							} else {
								open = false
								goto(`/task/${todo.data.id}`)
							}
						}}
						class="aria-selected:bg-accent/75 aria-selected:text-foreground"
						value={todo.data.id}
					>
						<!-- dummy checkbox -->
						<div class="mr-1.5 h-3 w-3 rounded border border-muted-foreground/75"></div>
						{todo.data.text}</Command.Item
					>
				{/each}
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
