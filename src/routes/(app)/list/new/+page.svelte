<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'

	import autosize from '$lib/actions/autosize'
	import { DotsThree } from 'phosphor-svelte'
	import ListDetail from '@/components/list-detail.svelte'

	export let data

	let notesTextarea: HTMLTextAreaElement
	let textInput: HTMLTextAreaElement

	let created = false
</script>

{#if data.replicache}
	<ListDetail list={null} replicache={data.replicache} new />
{/if}
