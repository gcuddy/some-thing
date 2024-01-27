<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui'
	import { buttonVariants } from '$lib/components/ui/button'
	import { cn } from '$lib/util/style'

	type $$Props = CalendarPrimitive.DayProps
	type $$Events = CalendarPrimitive.DayEvents

	export let date: $$Props['date']
	export let month: $$Props['month']
	let className: $$Props['class'] = undefined
	export { className as class }
</script>

<CalendarPrimitive.Day
	on:click
	{date}
	{month}
	class={cn(
		buttonVariants({ variant: 'ghost' }),
		'focus-visible tabular-nums transition-none',
		'text-xs',
		'h-8 w-8 p-0 font-medium',
		// Today
		'[&[data-today]:not([data-selected])]:bg-yellow-400/10 [&[data-today]:not([data-selected])]:text-accent-foreground focus-visible:[&[data-today]:not([data-selected])]:bg-accent',
		// Selected
		'data-[selected]:ring-focused ring-inset data-[selected]:text-accent-foreground data-[selected]:opacity-100 data-[selected]:ring-2 data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-accent data-[selected]:focus:text-accent-foreground data-[selected]:focus:ring-white',
		// Disabled
		'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
		// Unavailable
		'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
		// Outside months
		'data-[outside-month]:pointer-events-none data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50 [&[data-outside-month][data-selected]]:bg-accent/50 [&[data-outside-month][data-selected]]:text-muted-foreground [&[data-outside-month][data-selected]]:opacity-30',
		className
	)}
	{...$$restProps}
	let:selected
	let:disabled
	let:unavailable
	let:builder
>
	<slot {selected} {disabled} {unavailable} {builder}>
		{date.day}
	</slot>
</CalendarPrimitive.Day>
