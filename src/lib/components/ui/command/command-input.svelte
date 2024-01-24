<script lang="ts">
	import { Command as CommandPrimitive } from 'cmdk-sv'
	import { MagnifyingGlass } from 'phosphor-svelte'
	import { cn } from '$lib/util/style'

	type $$Props = CommandPrimitive.InputProps & {
        wrapperClass?: string
    }

	let className: string | undefined | null = undefined
	export { className as class }
	export let value: string = ''
	export let icon = true
    export let wrapperClass = ''
</script>

<div class={cn('flex items-center border-b px-3', wrapperClass)} data-cmdk-input-wrapper="">
	{#if icon}
		<MagnifyingGlass class="mr-2 h-4 w-4 shrink-0 opacity-50" />
	{/if}
	<CommandPrimitive.Input
		class={cn(
			'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{...$$restProps}
		bind:value
	/>
</div>
