<script lang="ts">
	import Command from './command.svelte'
	import * as Dialog from '$lib/components/ui/dialog'
	import type { Dialog as DialogPrimitive } from 'bits-ui'
	import type { Command as CommandPrimitive } from 'cmdk-sv'
	import { cn } from '@/util/style'

	type $$Props = DialogPrimitive.Props &
		CommandPrimitive.CommandProps & {
			dialogClass?: string
		}

	export let open: $$Props['open'] = false
	export let value: $$Props['value'] = undefined

	let className: $$Props['class'] = undefined
	export { className as class }
	export let dialogClass = ''
</script>

<Dialog.Root bind:open {...$$restProps}>
	<Dialog.Content
		overlayClass="!backdrop-blur-0 bg-background/0"
		class={cn('overflow-hidden p-0 shadow-2xl', dialogClass)}
	>
		<Command
			class={cn(
				'p-1.5 [&_[data-cmdk-group-heading]]:px-2 [&_[data-cmdk-group-heading]]:font-medium [&_[data-cmdk-group-heading]]:text-muted-foreground  [&_[data-cmdk-group]:not([hidden])_~[data-cmdk-group]]:pt-0 [&_[data-cmdk-input]]:h-8 [&_[data-cmdk-item]]:px-2 [&_[data-cmdk-item]]:py-1.5 [&_[data-cmdk-item]_svg]:h-5 [&_[data-cmdk-item]_svg]:w-5',
				className
			)}
			{...$$restProps}
			bind:value
		>
			<slot />
		</Command>
	</Dialog.Content>
</Dialog.Root>
