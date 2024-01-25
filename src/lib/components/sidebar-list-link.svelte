<script lang="ts">
	import type { List } from '@/core/list'
	import { cn, styleToString } from '@/util/style'
	import { Circle, Cube, ListChecks } from 'phosphor-svelte'
	import type { ComponentProps } from 'svelte'
	import { derived } from 'svelte/store'
	import SidebarLink from './sidebar-link.svelte'
	import { getSelected } from './sidebar.svelte'
	import * as ContextMenu from '$lib/components/ui/context-menu'
	import { getReplicache } from '../../routes/(app)/replicache'

	type $$Props = {
		list: List
		onChange?: (open: boolean) => void
		selectedIds?: string[]
	} & Omit<ComponentProps<SidebarLink>, 'href'>

	const rep = getReplicache()

	export let onChange: (open: boolean) => void = () => {}
	export let list: List
	export let lists: List[] = []
	let className: $$Props['class'] = undefined
	export { className as class }
	export let selectedIds: string[] = []

	const selectedState = getSelected()

	const rounded = derived(selectedState, $selected => {
		if ($selected.length <= 1)
			return {
				className: 'rounded-md'
			}
		const inSelected = $selected.findIndex(s => s === list.id)
		if (inSelected === -1)
			return {
				className: 'rounded-md'
			}

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

		let className = Array.from(str).join(' ')

		let style = ''

		// handle border
		if (className.includes('rounded-t-md') && !className.includes('rounded-b-md')) {
			console.log('adding border transparent to b', { className })
			// style += ' border-b-gray-200'
			style += styleToString({
				'border-bottom-color': 'transparent'
			})
		} else if (className.includes('rounded-b-md') && !className.includes('rounded-t-md')) {
			console.log('adding border transparent to t', { className })
			// className += ' border-t-gray-200'
			style += styleToString({
				'border-top-color': 'transparent'
			})
		}

		if (!className) {
			style += styleToString({
				'border-top-color': 'transparent',
				'border-bottom-color': 'transparent'
			})
			// className += ' border-t-gray-200 border-b-gray-200'
		}

		console.log(`returning className of ${className} for`, list)

		return {
			className: className.trim(),
			style
		}
	})
</script>

<ContextMenu.Root
	onOpenChange={open => {
		onChange(open)
	}}
>
	<ContextMenu.Trigger class="group">
		<SidebarLink
			on:click
			data-id={list.id}
			style={$rounded.style}
			class={cn(
				'w-full',
				list.type === 'area' && 'font-semibold',
				'rounded-none',
				$rounded.className,
				className
			)}
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
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item
			on:click={async () => {
				console.log('deleting', selectedIds)
				await rep.mutate.list_delete(selectedIds)
			}}>Delete</ContextMenu.Item
		>
	</ContextMenu.Content>
</ContextMenu.Root>
