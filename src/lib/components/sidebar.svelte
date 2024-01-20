<script lang="ts">
	import { syncing } from '$lib/stores/sync'
	import { ArrowsClockwise } from 'phosphor-svelte'
</script>

<div class="fixed bottom-0 left-0 top-0 w-60">
	<nav class="relative flex h-full flex-col border-r">
		<div class="flex flex-[initial] shrink-0 flex-col items-stretch gap-3 px-3 pb-2 pt-1">
			<div class="flex justify-between">
				<span>todo</span>
				{#if $syncing}
					<ArrowsClockwise class="animate-spin" />
				{/if}
			</div>
		</div>
		<div class="mb-0.5 flex flex-[initial] flex-col overflow-y-auto rounded px-3">
			<!-- scroll  -->
			<a href="/">Inbox</a>
		</div>
	</nav>
</div>
