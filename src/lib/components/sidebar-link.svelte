<script lang="ts">
	import { page } from '$app/stores'
	import { cn } from '@/util/style'

	export let href: string

	$: active = $page.url.pathname === href

	let className = ''

	export { className as class }
</script>

<a
	{href}
	class={cn(
		'px-2 py-1 text-sm rounded-md inline-flex items-center cursor-default',
		active && 'bg-gray-200 text-secondary-foreground',
		className
	)}
>
	<slot /></a
>
