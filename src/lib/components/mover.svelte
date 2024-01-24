<script lang="ts">
	import * as Command from '$lib/components/ui/command'
	import { list } from 'postcss'
	import { type ReplicacheType } from '../../routes/(app)/replicache'
	import { ListStore } from '@/data/list'
	import commandScore from 'command-score'
	import { createId } from '@/util/nanoid'
	import { goto } from '$app/navigation'
	import { Plus } from 'phosphor-svelte'
	import { cn } from '@/util/style'

	export let ids: Array<string>
	export let rep: ReplicacheType
	export let open = false
	export let searchValue = ''
	export let onMove = () => {}

	const lists = ListStore.list.watch(
		() => rep,
		() => []
	)()

	$: results = $lists.filter(list => {
		if (!list.name) return false
		if (!searchValue) return true
		return commandScore(list.name.toLowerCase(), searchValue) > 0.5
	})
	$: console.log({ results, commandScore })
</script>

<Command.Dialog
	dialogClass="max-w-xs"
	class="text-popover-foreground"
	bind:open
	openFocus={null}
	shouldFilter={false}
>
	<Command.Input
		wrapperClass="border-gray-600"
		bind:value={searchValue}
		autofocus
		placeholder="Move"
	/>
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<!-- <Command.Separator /> -->
		<Command.Group class="text-popover-foreground">
			{#each results as list}
				<Command.Item
					onSelect={async () => {
						console.log('HELLO???', ids)
						await rep.mutate.todo_update({
							id: ids,
							data: {
								listId: list.id
							}
						})
						onMove()
					}}
					value={list.id}
				>
					{list.name}
				</Command.Item>
			{/each}
		</Command.Group>
		{#if searchValue && results.every(r => r.name !== searchValue)}
			{#if results.length}
				<Command.Separator alwaysRender class="bg-gray-600" />
			{/if}
			<Command.Group class={cn(results.length && '!pt-1')}>
				<Command.Item
					onSelect={async () => {
						const id = createId()
						await rep.mutate.list_create({
							name: searchValue,
							id,
							notes: ''
						})
						await rep.mutate.todo_update({
							id: ids,
							data: {
								listId: id
							}
						})
						onMove()
						// await goto(`/list/${id}`)
					}}
					value={searchValue}
					class="text-white"
				>
					<Plus class="mr-1.5 h-4 w-4 text-muted-foreground" />
					Create list "{searchValue}"
				</Command.Item>
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>
