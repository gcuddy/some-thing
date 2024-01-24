<script lang="ts">
	import { Plus } from 'phosphor-svelte'
	import { Button } from './ui/button'
</script>

<div class="flex h-9 items-center justify-center">
	<Button variant="ghostOutline">
		<Plus class="h-4 w-4" />
		<span class="sr-only">Add</span>
	</Button>
</div>
