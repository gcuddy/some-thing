<script lang="ts">
	import { syncing } from '$lib/stores/sync'
	import { ArrowsClockwise, Plus, SlidersHorizontal } from 'phosphor-svelte'
	import Button from './ui/button/button.svelte'
</script>

<div class="fixed bottom-0 left-0 top-0 w-60">
	<nav class="relative flex h-full flex-col border-r bg-gray-100">
		<div class="flex flex-[initial] shrink-0 flex-col items-stretch gap-3 px-3.5 pb-2 pt-1">
			<div class="flex justify-between">
				<span>todo</span>
				{#if $syncing}
					<ArrowsClockwise class="animate-spin" />
				{/if}
			</div>
		</div>
		<div class="flex flex-[initial] grow flex-col overflow-y-auto rounded px-3.5">
			<!-- scroll  -->
			<a href="/">Inbox</a>
		</div>
		<div class="flex justify-between px-3.5 py-2 border-t">
			<Button href="/list/new" variant="ghostOutline" class="text-sm text-muted-foreground">
				<Plus class="mr-1.5" />
				New list
			</Button>
			<Button variant="ghostOutline" size="icon" class="text-muted-foreground">
				<SlidersHorizontal class="h-4 w-4" />
				<span class="sr-only">Preferences</span>
			</Button>
		</div>
	</nav>
</div>
