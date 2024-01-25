<script lang="ts">
	import type { List } from '@/core/list'
	import SidebarListLink from './sidebar-list-link.svelte'
	import { flip } from 'svelte/animate'
	import { dndzone } from 'svelte-dnd-action'
	import { cn } from '@/util/style'
	import { ArrowElbowLeft } from 'phosphor-svelte'
	import { getReplicache } from '../../routes/(app)/replicache'
	import { createMultiSelectHandler } from '@/actions/multi-select'
	import { writable } from 'svelte/store'
	import { getSelected } from './sidebar.svelte'

	const rep = getReplicache()

	export let lists: Array<
		List & {
			children?: List[]
		}
	> = []
	let className = ''
	export { className as class }
	export let type: 'list' | 'area' = 'list'
	export let areaId: string | null = null

	export let multiSelectable = true
	let wrapper: HTMLElement

	let multi: ReturnType<typeof createMultiSelectHandler>

	$: if (multiSelectable && wrapper) {
		multi = createMultiSelectHandler({
			target: '[data-sidebar-list-item]',
			scope: wrapper
		})
	}

	const idToLastIndex = new Map<string, number>()
	console.log({ lists })
	for (let i = 0; i < lists.length; i++) {
		idToLastIndex.set(lists[i].id, i)
	}

	function handleSort(e: CustomEvent<DndEvent<List>>) {
		lists = e.detail.items
	}

	function setList(l: List[]) {}

	async function handleFinalize(e: CustomEvent<DndEvent<List>>) {
		const i = e.detail.items.findIndex(l => l.id === e.detail.info.id)
		console.log({ i, id: e.detail.info.id, idToLastIndex })
		// if (i === idToLastIndex.get(e.detail.info.id)) return
		// find correct index
		if (i === -1) return
		idToLastIndex.set(e.detail.info.id, i)
		if (i === 0) {
			const sortIndex = (lists[0].index ?? 0) - 100
			lists = e.detail.items
			await rep.mutate.list_update({
				id: [e.detail.info.id],
				data: {
					areaId,
					index: sortIndex
				}
			})
		} else if (i === lists.length - 1) {
			const sortIndex = (lists[lists.length - 1].index ?? 0) + 100

			lists = e.detail.items
			await rep.mutate.list_update({
				id: [e.detail.info.id],
				data: {
					areaId,
					index: sortIndex
				}
			})
		} else {
			let sortIndex = Math.floor(((lists[i - 1].index ?? 0) + (lists[i + 1].index ?? 0)) / 2)
			if (sortIndex === lists[i - 1].index) {
				// then we'll need to change things... find out which side is shorter
				const left = lists.slice(0, i)
				const right = lists.slice(i + 1)
				// todo: ideally this is done in a better batch update
				if (left.length < right.length) {
					// then we need to move it to the left
					for (let i = 0; i < left.length; i++) {
						left[i].index = (left[i].index ?? 0) - 100
						lists = e.detail.items
						await rep.mutate.list_update({
							id: [left[i].id],
							data: {
								areaId,
								index: left[i].index
							}
						})
					}
				} else {
					// then we need to move it to the right
					for (let i = 0; i < right.length; i++) {
						right[i].index = (right[i].index ?? 0) + 100
						lists = e.detail.items
						await rep.mutate.list_update({
							id: [right[i].id],
							data: {
								areaId,
								index: right[i].index
							}
						})
					}
				}
			} else {
				// we're good to go
				lists = e.detail.items
				await rep.mutate.list_update({
					id: [e.detail.info.id],
					data: {
						areaId,
						index: sortIndex
					}
				})
			}
		}

		console.log({ e })
	}

	const flipDurationMs = 200

	function outsideClick(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (node && !node.contains(event.target as Node)) {
				multi?.reset()
			}
		}
		document.addEventListener('click', handleClick)
		return {
			destroy() {
				document.removeEventListener('click', handleClick)
			}
		}
	}

	const contextMenuSelected = writable<string[]>([])

	const selected = getSelected()
</script>

<div
	bind:this={wrapper}
	use:outsideClick
	class={cn('flex min-h-7 flex-col', className)}
	use:dndzone={{
		items: lists,
		flipDurationMs,
		type,
		dropTargetStyle: {}
	}}
	on:consider={handleSort}
	on:finalize={handleFinalize}
>
	{#each lists as list, index (list.id)}
		<div class="flex w-full flex-col" animate:flip={{ duration: flipDurationMs }}>
			<SidebarListLink
				selectedIds={$selected}
				onChange={open => {
					if (open) {
						// check if id is in selected
						if ($selected.includes(list.id)) {
							contextMenuSelected.set($selected)
						} else {
							contextMenuSelected.set([list.id])
						}
					} else {
						contextMenuSelected.set([])
					}
				}}
				on:click={e => {
					if (e.shiftKey) {
						e.preventDefault()
					}
					if (multi) multi.handleClick(e)
				}}
				{list}
				{lists}
				data-sidebar-list-item
				class={cn($contextMenuSelected.includes(list.id) && 'border-accent')}
			/>
			{#if list.children}
				<svelte:self lists={list.children} type="list" areaId={list.id} />
			{/if}
		</div>
	{/each}
</div>
