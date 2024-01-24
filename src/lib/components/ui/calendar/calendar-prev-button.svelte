<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui'
	import { CaretLeft } from 'phosphor-svelte'
	import { buttonVariants } from '$lib/components/ui/button'
	import { cn } from '$lib/util/style'

	type $$Props = CalendarPrimitive.PrevButtonProps
	type $$Events = CalendarPrimitive.PrevButtonEvents

	let className: $$Props['class'] = undefined
	export { className as class }
</script>

<CalendarPrimitive.PrevButton
	on:click
	class={cn(
		buttonVariants({ variant: 'outline' }),
		'h-5 w-5 bg-transparent p-0 opacity-50 hover:opacity-100',
		className
	)}
	{...$$restProps}
	let:builder
>
	<slot {builder}>
		<CaretLeft class="h-4 w-4" />
	</slot>
</CalendarPrimitive.PrevButton>
