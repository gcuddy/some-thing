<script lang="ts">
	import { MagnifyingGlass, Plus } from 'phosphor-svelte'
	import { Button } from './ui/button'
	import { createEventDispatcher } from 'svelte'
	import { gotoOpen } from '@/stores/goto'
	const dispatch = createEventDispatcher()

	export let quickFind = true
</script>

<div class="flex mx-auto h-9 max-w-screen-lg items-center justify-center">
	<Button
        class="grow"
		variant="ghostOutline"
		on:click={() => {
			dispatch('add')
		}}
	>
		<Plus class="h-4 w-4" />
		<span class="sr-only">Add</span>
	</Button>

	{#if quickFind}
		<Button
            class="grow"
			variant="ghostOutline"
			on:click={() => {
				gotoOpen.set(true)
			}}
		>
			<MagnifyingGlass class="h-4 w-4" />
			<span class="sr-only">Quick Find</span>
		</Button>
	{/if}
</div>
