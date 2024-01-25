<script lang="ts">
	import type { List } from '@/core/list'
	import type { ComponentProps } from 'svelte'
	import SidebarLink from './sidebar-link.svelte'
	import { cn } from '@/util/style'
	import { Circle, Cube, ListChecks } from 'phosphor-svelte'

	type $$Props = {
		list: List
	} & Omit<ComponentProps<SidebarLink>, 'href'>

	export let list: List
	let className: $$Props['class'] = undefined
	export { className as class }
</script>

<SidebarLink
    on:click
	class={cn('w-full', list.type === 'area' && 'font-semibold', className)}
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
