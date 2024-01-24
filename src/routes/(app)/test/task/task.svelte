<script lang="ts">
	import { cn } from '@/util/style'
	import { AnimatePresence, AnimateSharedLayout, Motion } from 'svelte-motion'
	export let open = false
	export let selected = false
	export let text = 'To-do'

	function clickOutside(node: HTMLElement) {
		const handleClick = (event: MouseEvent) => {
			if (node && !node.contains(event.target as Node)) {
				open = false
				selected = false
			}
		}

		document.addEventListener('click', handleClick, true)

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true)
			}
		}
	}
</script>

<Motion
	let:motion
	layout
	initial={{ borderRadius: 10 }}
	animate={{
		backgroundColor: selected && !open ? 'rgb(191, 219, 254)' : '',
		boxShadow: open ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : undefined
		// scale: open ? 1.05 : 1,
	}}

>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- class={cn('', selected && !open && 'bg-blue-200')} -->
	<div
		use:motion
		use:clickOutside
		on:dblclick={() => {
			if (!open) {
				open = true
			}
		}}
		on:click={() => {
			selected = true
		}}
	>
		<Motion layout let:motion={m1} >
			<div use:m1 class="flex w-full items-center gap-2">
				<input type="checkbox" />
				{#if open}
					<input type="text" class="w-full" bind:value={text} />
				{:else}
					<span>{text}</span>
				{/if}
			</div>
		</Motion>
		<AnimatePresence list={open ? [{ key: 1 }] : []}>
			<Motion
				layout
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}

				let:motion={m2}
			>
				<div use:m2 class="flex resize-none flex-col">
					<textarea rows={2} class="w-full" placeholder="notes" />
					<div class="flex">
						<button>save</button>
						<button>calendar</button>
					</div>
				</div>
			</Motion>
		</AnimatePresence>
	</div>
</Motion>
