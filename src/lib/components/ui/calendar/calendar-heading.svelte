<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui'
	import { cn } from '$lib/util/style'

	type $$Props = CalendarPrimitive.HeadingProps

	let className: string | undefined | null = undefined
	export { className as class }
</script>

<CalendarPrimitive.Heading
	let:headingValue
	class={cn('text-xs font-medium', className)}
	{...$$restProps}
>
	<slot {headingValue}>
		{headingValue}
	</slot>
</CalendarPrimitive.Heading>
