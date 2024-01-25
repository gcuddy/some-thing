<script lang="ts">
	import ListDetail from '@/components/list-detail.svelte'

	export let data

	let notesTextarea: HTMLTextAreaElement
	let textInput: HTMLTextAreaElement

	let created = false
</script>

{#if data.replicache}
	<div class="mx-auto w-full max-w-screen-lg pl-14 pr-10">
		<ListDetail replicache={data.replicache} new={data.type} />
	</div>
{/if}
