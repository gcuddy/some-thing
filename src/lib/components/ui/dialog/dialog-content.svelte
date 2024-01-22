<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui'
	import * as Dialog from '.'
	import { cn, flyAndScale } from '$lib/util/style'
	import { X } from 'phosphor-svelte'
	import { getContext } from 'svelte'
	import type { Writable } from 'svelte/store'

	type $$Props = DialogPrimitive.ContentProps

	let className: $$Props['class'] = undefined
	export let transition: $$Props['transition'] = flyAndScale
	export let transitionConfig: $$Props['transitionConfig'] = {
		duration: 200
	}
	export { className as class }

	// TODO: this is perhaps brittle, getting from bits-ui
	const {
		states: { open }
	} = getContext('dialog') as {
		states: {
			open: Writable<boolean>
		}
	}
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	{#if $open}
		<div
			transition:transition={transitionConfig}
			{...$$restProps}
			class={cn('fixed left-0 top-10 z-50 flex w-screen items-start justify-center px-3 py-[13vh]')}
		>
			<DialogPrimitive.Content
				{transition}
				{transitionConfig}
				class={cn(
					'relative flex max-w-2xl flex-1 flex-col justify-center gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',

					className
				)}
				{...$$restProps}
			>
				<slot />
				<!-- <DialogPrimitive.Close
					class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
				>
					<X weight="thin" class="h-4 w-4" />
					<span class="sr-only">Close</span>
				</DialogPrimitive.Close> -->
			</DialogPrimitive.Content>
		</div>
	{/if}
</Dialog.Portal>
