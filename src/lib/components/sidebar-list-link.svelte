<script lang="ts">
	import type { List } from '@/core/list'
	import type { ComponentProps } from 'svelte'
	import SidebarLink from './sidebar-link.svelte'
	import { cn } from '@/util/style'
	import { Circle, Cube, ListChecks } from 'phosphor-svelte'
	import { getSelected } from './sidebar.svelte'
	import { derived } from 'svelte/store'
	import { prev } from '@melt-ui/svelte/internal/helpers'

	type $$Props = {
		list: List
	} & Omit<ComponentProps<SidebarLink>, 'href'>

	export let list: List
	export let lists: List[] = []
	let className: $$Props['class'] = undefined
	export { className as class }

	const selectedState = getSelected()

	const rounded = derived(selectedState, $selected => {
        if ($selected.length <= 1) return 'rounded-md'
		const inSelected = $selected.findIndex(s => s === list.id)
		if (inSelected === -1) return 'rounded-md'

		console.log({ inSelected, $selected })
		let str = new Set<string>()
		//    check adjacency of our list in the selected list
		const indexInLists = lists.findIndex(l => l.id === list.id)

		if (indexInLists === 0) {
			str.add('rounded-t-md')
		} else if (indexInLists === lists.length - 1) {
			str.add('rounded-b-md')
		}

		// check adjacency
		const previousSelected = $selected[inSelected - 1]
		const nextSelected = $selected[inSelected + 1]
		console.log(list, { previousSelected, nextSelected })
		if (!previousSelected) {
			str.add('rounded-t-md')
		} else if (!nextSelected) {
			str.add('rounded-b-md')
		}
		if (previousSelected) {
			const previousIndex = lists.findIndex(l => l.id === previousSelected)
			if (previousIndex !== indexInLists - 1) {
				str.add('rounded-t-md')
			}
		}

		if (nextSelected) {
			const nextIndex = lists.findIndex(l => l.id === nextSelected)
			console.log({ nextIndex, indexInLists })
			if (nextIndex !== indexInLists + 1) {
				str.add('rounded-b-md')
			}
		}

		return Array.from(str).join(' ')
	})
</script>

<SidebarLink
	on:click
	data-id={list.id}
	class={cn('w-full', list.type === 'area' && 'font-semibold', 'rounded-none', $rounded, className)}
	{...$$restProps}
	href={`/list/${list.id}`}
>
	{#if list.type === 'area'}
		<Cube weight="bold" class="mr-1.5 h-4 w-4 text-muted-foreground/50" />
	{:else if list.type === 'list'}
		<ListChecks weight="regular" class="mr-1.5 h-4 w-4 text-muted-foreground/50 " />
	{:else}
		<!-- TODO: progress -->
		<Circle weight="regular" class="mr-1.5 h-4 w-4 text-muted-foreground/50 " />
	{/if}
	<slot>
		{list.name}
	</slot></SidebarLink
>
