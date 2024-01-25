<script lang="ts">
	import { page } from '$app/stores'
	import { cn } from '@/util/style'

	export let href: string

	$: active = $page.url.pathname === href

	let className = ''

	export { className as class }
</script>

<a
	on:click
	data-pivot={active}
	data-focus={active}
	{...$$restProps}
	{href}
	class={cn(
		'inline-flex cursor-default items-center rounded-md px-2 py-1 text-sm data-[pivot=true]:bg-red-500',
		// selected
		'data-[selected=true]:bg-gray-200 data-[selected=true]:text-secondary-foreground dark:data-[selected=true]:bg-gray-700',
		active && 'bg-gray-200 text-secondary-foreground dark:bg-gray-700',
		className
	)}
>
	<slot /></a
>
