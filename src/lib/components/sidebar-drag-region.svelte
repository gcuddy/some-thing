<script lang="ts">
	import type { List } from '@/core/list'
	import SidebarListLink from './sidebar-list-link.svelte'
	import { flip } from 'svelte/animate'
	import { dndzone } from 'svelte-dnd-action'

	export let lists: List[] = []

	function handleSort(e: CustomEvent<DndEvent<List>>) {
		lists = e.detail.items
	}
	function handleFinalize(e: CustomEvent<DndEvent<List>>) {
		lists = e.detail.items
	}

	const flipDurationMs = 200
</script>

<div
	class="flex flex-col"
	use:dndzone={{
		items: lists,
		flipDurationMs
	}}
	on:consider={handleSort}
	on:finalize={handleFinalize}
>
	{#each lists as list (list.id)}
		<div class="w-full" data-hello animate:flip={{ duration: flipDurationMs }}>
			<SidebarListLink {list} />
		</div>
	{/each}
</div>
