<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui'
	import * as Dialog from '.'
	import { cn, flyAndScale } from '$lib/util/style'
	import { X } from 'phosphor-svelte'
	import { getContext } from 'svelte'
	import type { Writable } from 'svelte/store'
	import { fade, fly } from 'svelte/transition'

	type $$Props = DialogPrimitive.ContentProps & {
		open?: boolean
	}

	let className: $$Props['class'] = undefined
	export let transition: $$Props['transition'] = flyAndScale
	export let transitionConfig: $$Props['transitionConfig'] = {
		duration: 200
	}
	export { className as class }

	// TODO: get this automatically
	export let open = true
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	{#if open}
		<div class="fixed left-0 top-0 z-50 h-full w-screen">
			<div
				transition:fade|global
				class="absolute left-0 top-40 z-50 flex w-screen items-start justify-center px-3 py-[13vh]"
			>
				<div transition:fly|global>Testing testing yeahhhhh</div>
			</div>
		</div>
	{/if}
</Dialog.Portal>
