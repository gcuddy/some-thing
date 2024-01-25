<script lang="ts">
	import ListDetail from '@/components/list-detail.svelte'

	export let data

	let notesTextarea: HTMLTextAreaElement
	let textInput: HTMLTextAreaElement

	let created = false
</script>

{#if data.replicache}
	<ListDetail replicache={data.replicache} new={data.type} />
{/if}
