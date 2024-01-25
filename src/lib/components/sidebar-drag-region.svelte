<script lang="ts">
	import type { List } from '@/core/list'
	import SidebarListLink from './sidebar-list-link.svelte'
	import { flip } from 'svelte/animate'
	import { dndzone } from 'svelte-dnd-action'
	import { cn } from '@/util/style'
	import { ArrowElbowLeft } from 'phosphor-svelte'
	import { getReplicache } from '../../routes/(app)/replicache'

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

	const idToLastIndex = new Map<string, number>()
	for (let i = 0; i < lists.length; i++) {
		idToLastIndex.set(lists[i].id, i)
	}

	function handleSort(e: CustomEvent<DndEvent<List>>) {
		lists = e.detail.items
	}
	async function handleFinalize(e: CustomEvent<DndEvent<List>>) {
		lists = e.detail.items
		const i = lists.findIndex(l => l.id === e.detail.info.id)
		console.log({ i, id: e.detail.info.id, idToLastIndex })
		if (i === idToLastIndex.get(e.detail.info.id)) return
		// find correct index
		if (i === -1) return
		idToLastIndex.set(e.detail.info.id, i)
		if (i === 0) {
			const sortIndex = (lists[0].index ?? 0) - 100
			await rep.mutate.list_update({
				id: [e.detail.info.id],
				data: {
					areaId,
					index: sortIndex
				}
			})
		} else if (i === lists.length - 1) {
			const sortIndex = (lists[lists.length - 1].index ?? 0) + 100
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
				await rep.mutate.list_update({
					id: [e.detail.info.id],
					data: {
						index: sortIndex
					}
				})
			}
		}

		console.log({ e })
	}

	const flipDurationMs = 200
</script>

<div
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
	{#each lists as list (list.id)}
		<div class="flex w-full flex-col" data-hello animate:flip={{ duration: flipDurationMs }}>
			<SidebarListLink {list} />
			{#if list.children}
				<svelte:self lists={list.children} type="list" areaId={list.id} />
			{/if}
		</div>
	{/each}
</div>
