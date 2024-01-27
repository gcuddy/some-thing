<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui'
	import { cn } from '$lib/util/style'

	type $$Props = DropdownMenuPrimitive.SeparatorProps

	let className: $$Props['class'] = undefined
	export { className as class }
</script>

<DropdownMenuPrimitive.Separator
	class={cn('-mx-1 my-1 h-px bg-gray-600', className)}
	{...$$restProps}
/>
