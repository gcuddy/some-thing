<script lang="ts">
	import { Plus } from 'phosphor-svelte'
	import { Button } from './ui/button'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
</script>

<div class="flex h-9 items-center justify-center">
	<Button
		variant="ghostOutline"
		on:click={() => {
			dispatch('add')
		}}
	>
		<Plus class="h-4 w-4" />
		<span class="sr-only">Add</span>
	</Button>
</div>
