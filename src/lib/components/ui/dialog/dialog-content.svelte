<script lang="ts">
	import { cn, flyAndScale } from '$lib/util/style'
	import { Dialog as DialogPrimitive } from 'bits-ui'
	import { getContext } from 'svelte'
	import type { Writable } from 'svelte/store'
	import * as Dialog from '.'

	type $$Props = DialogPrimitive.ContentProps & {
		overlay?: boolean
		overlayClass?: string
	}

	let className: $$Props['class'] = undefined
	export let transition: NonNullable<$$Props['transition']> = flyAndScale
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

	export let overlayClass = ''
</script>

<Dialog.Portal>
	<Dialog.Overlay class={cn('fixed inset-0 z-50 bg-black/10', overlayClass)} />
	{#if $open}
		<!-- TODO: clean up type problem -->
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
			</DialogPrimitive.Content>
		</div>
	{/if}
</Dialog.Portal>
