<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'

	import autosize from '$lib/actions/autosize'
	import { CheckCircle, Circle, Cube, DotsThree, ListChecks, Trash } from 'phosphor-svelte'
	import type { ReplicacheType } from '../../routes/(app)/replicache'
	import type { List } from '@/core/list'
	import { createId } from '@/util/nanoid'
	import { page } from '$app/stores'
	import { afterNavigate, goto } from '$app/navigation'
	import { capitalize } from '@/util/capitalize'
	import { onMount } from 'svelte'
	import { sleep } from '@/util/sleep'
	import { ListStore } from '@/data/list'

	export let replicache: ReplicacheType
	export let list: Pick<List, 'id' | 'name' | 'notes' | 'type'> | null = null
	export const lists = ListStore.list.watch(
		() => replicache,
		() => []
	)()

	$: console.log({ list, _new })

	let notesTextarea: HTMLTextAreaElement
	let textInput: HTMLTextAreaElement

	let _new: List['type'] | undefined = undefined

	$: type = _new ?? list?.type ?? 'project'
	export { _new as new }

	afterNavigate(() => {
		console.log('after navigate')
		if (_new) {
			console.log('autofocus')
			sleep(25).then(() => {
				textInput?.focus()
			})
		}
	})
</script>

<div class="flex h-full w-full shrink grow flex-col">
	<div class="flex items-center gap-2">
		{#if type === 'project'}
			<!-- <input type="checkbox" class="text-lg" /> -->
			<Circle weight="bold" class="h-6 w-6 text-blue-500" />
		{:else if type === 'area'}
			<Cube weight="bold" class="h-6 w-6 text-emerald-500" />
		{:else if type === 'list'}
			<ListChecks weight="bold" class="h-6 w-6 text-gray-400" />
		{/if}
		<textarea
			value={list?.name ?? ''}
			bind:this={textInput}
			class="flex-1 bg-inherit py-1 text-2xl font-semibold focus-visible:outline-none"
			on:blur={async e => {
				console.log({ _new, e, list })
				if (_new && e.currentTarget.value.trim()) {
					const id = createId()
					const sortIndex =
						$lists.reduce((min, list) => {
							const index = list.index ?? 0
							if (index < min) {
								return index
							}
							return min
						}, 0) - 100
					const _list = {
						id,
						name: e.currentTarget.value.trim(),
						notes: '',
						type: _new,
						index: sortIndex
					}
					console.log('creating list', { _list })
					await replicache.mutate.list_create(_list)
					list = _list
					_new = undefined
					console.log({ $page, pathname: $page.url.pathname })
					if ($page.url.pathname === '/list/new') {
						console.log('navgatig')
						await goto(`/list/${id}`)
					}
				} else if (list) {
					if (list.name !== e.currentTarget.value.trim()) {
						// list.name = e.currentTarget.value.trim()
						await replicache.mutate.list_update({
							id: [list.id],
							data: {
								name: e.currentTarget.value.trim()
							}
						})
					}
				}
			}}
			on:keydown={e => {
				if (e.key === 'Enter') {
					e.preventDefault()
					e.currentTarget.blur()
				}
				if (e.key === 'ArrowDown') {
					e.preventDefault()
					notesTextarea?.focus()
				}
			}}
			use:autosize
			rows={1}
			placeholder="New {capitalize(type)}"
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="inline-flex cursor-default items-center justify-center rounded-md px-1 data-[state=open]:bg-muted"
			>
				<DotsThree weight="bold" class="h-6 w-6 text-muted-foreground" />
				<span class="sr-only">Open menu</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<!-- <DropdownMenu.Label>My Account</DropdownMenu.Label> -->
					<DropdownMenu.Item>
						<CheckCircle class="mr-1.5 text-accent group-data-[highlighted]:text-white" />
						Mark as Complete</DropdownMenu.Item
					>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						on:click={async () => {
							if (list?.id) {
								await replicache.mutate.list_delete([list.id])
							}
							await goto('/')
						}}
					>
						<Trash class="mr-1.5 text-accent group-data-[highlighted]:text-white" />
						Delete List</DropdownMenu.Item
					>
					<!-- <DropdownMenu.Item>Team</DropdownMenu.Item>
					<DropdownMenu.Item>Subscription</DropdownMenu.Item> -->
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div>
		<textarea
			value={list?.notes ?? ''}
			on:keydown={e => {
				if (e.key === 'ArrowUp') {
					if (e.currentTarget.selectionStart === 0) {
						e.preventDefault()
						textInput?.focus()
					}
				}
			}}
			on:blur={async e => {
				if (list && (list.notes ?? '') !== e.currentTarget.value.trim()) {
					// list.notes = e.currentTarget.value.trim()
					await replicache.mutate.list_update({
						id: [list.id],
						data: {
							notes: e.currentTarget.value.trim()
						}
					})
				}
			}}
			bind:this={notesTextarea}
			class="w-full grow py-1 text-sm focus-visible:outline-none"
			use:autosize
			placeholder="Notes"
		/>
	</div>
</div>
