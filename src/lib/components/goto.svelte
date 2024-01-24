<script lang="ts">
	import * as Command from '$lib/components/ui/command'
	import { SvelteComponent, onMount, tick, type ComponentType } from 'svelte'
	import { type ReplicacheType } from '../../routes/(app)/replicache'
	import { TodoStore } from '@/data/todo'
	import { ListStore } from '@/data/list'
	import type { Todo } from '@/core/todo'
	import type { List } from '@/core/list'
	import { goto } from '$app/navigation'
	import { Circle, Star, Tray } from 'phosphor-svelte'
	let open = false
	let searchValue = ''

	export let rep: ReplicacheType

	const todos = TodoStore.list.watch(
		() => rep,
		() => []
	)()
	const lists = ListStore.list.watch(
		() => rep,
		() => []
	)()

	type TodoItem = {
		type: 'todo'
		data: Todo
	}

	type ListItem = {
		type: 'list'
		data: List
	}

	type SpecialListItem = {
		type: 'special'
		data: {
			name: string
			icon: ComponentType
			iconClass: string
			iconProps: Record<string, unknown>
			id: string
			href: string
		}
	}

	type SearchItem = ListItem | TodoItem | SpecialListItem

	const specials: Array<SpecialListItem> = [
		{
			type: 'special',
			data: {
				href: '/today',
				id: '__special__:today',
				name: 'Today',
				icon: Star,
				iconClass: 'text-yellow-400',
				iconProps: {
					weight: 'fill'
				}
			}
		},
		{
			type: 'special',
			data: {
				href: '/',
				id: '__special__:inbox',
				name: 'Inbox',
				icon: Tray,
				iconClass: 'text-accent',
				iconProps: {
					weight: 'duotone'
				}
			}
		}
	]

	function handleSearch(searchValue: string) {
		const _todos: TodoItem[] = []
		const _lists: Array<SpecialListItem | ListItem> = []

		for (const todo of $todos) {
			if (todo.text?.toLowerCase().includes(searchValue.toLowerCase())) {
				_todos.push({
					type: 'todo',
					data: todo
				})
			}
		}

		for (const special of specials) {
			if (special.data.name?.toLowerCase().includes(searchValue.toLowerCase())) {
				_lists.push(special)
			}
		}

		for (const list of $lists) {
			if (list.name?.toLowerCase().includes(searchValue.toLowerCase())) {
				_lists.push({
					type: 'list',
					data: list
				})
			}
		}

		return {
			todos: _todos,
			lists: _lists
		}
	}

	$: results = handleSearch(searchValue)

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

		if (document.activeElement?.tagName === 'TEXAREA') return false
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
	class="bg-gray-100"
	bind:open
	openFocus={null}
	shouldFilter={false}
>
	<Command.Input
		wrapperClass="text-foreground"
		bind:value={searchValue}
		autofocus
		placeholder="Type a command or search..."
	/>
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		{#if results.lists.length}
			<Command.Group heading="Lists">
				{#each results.lists as list}
					<Command.Item
						class="aria-selected:bg-accent/50 aria-selected:text-foreground"
						onSelect={async () => {
							open = false
							if ('href' in list.data) {
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
						{:else}
							<!-- TODO: completed anduncompleted list -->
							<Circle class="mr-1.5 h-4 w-4 text-accent" />
						{/if}
						{list.data.name}</Command.Item
					>
				{/each}
			</Command.Group>
		{/if}
		{#if results.todos.length}
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
						class="aria-selected:bg-accent/50 aria-selected:text-foreground"
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
