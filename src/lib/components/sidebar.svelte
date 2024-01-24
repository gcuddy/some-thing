<script lang="ts">
	import { syncing } from '$lib/stores/sync'
	import { ArrowsClockwise, Cloud, Plus, SlidersHorizontal, Star, Tray } from 'phosphor-svelte'
	import Button from './ui/button/button.svelte'
	import Settings from '../../routes/(app)/(settings)/settings/+page.svelte'
	import { goto, preloadData, pushState } from '$app/navigation'
	import * as Dialog from '$lib/components/ui/dialog'
	import { page } from '$app/stores'
	import { getReplicache, type ReplicacheType } from '../../routes/(app)/replicache'
	import { ListStore } from '@/data/list'
	import { TodoStore } from '@/data/todo'
	import { derived } from 'svelte/store'
	import SidebarLink from './sidebar-link.svelte'
	import { filterFn } from '../../routes/(app)/today/filter'
	let settingsOpen = false

	export let rep: ReplicacheType

	const lists = ListStore.list.watch(
		() => rep,
		() => []
	)()

	const todos = TodoStore.list.watch(
		() => rep,
		() => []
	)()

	const inboxCount = derived(
		todos,
		$todos => $todos.filter(todo => !todo.listId && !todo.completed && !todo.startDate).length
	)

	const todayCount = derived(
		todos,
		$todos =>
			$todos.filter(todo => {
				if (!todo.startDate) return false
				if (todo.completed) return false
				return filterFn(todo)
			}).length
	)
</script>

<div class="fixed bottom-0 left-0 top-0 w-60">
	<nav class="relative flex h-full flex-col border-r bg-gray-100">
		<div class="flex h-10 flex-[initial] shrink-0 flex-col items-stretch gap-3 px-3.5 pb-2 pt-1">
			<div class="flex justify-between">
				<!-- <span>todo</span> -->
				<span></span>
				{#if $syncing}
					<!-- <ArrowsClockwise class="animate-spin" /> -->
					<Cloud weight="fill" class="animate-pulse text-muted-foreground" />
				{/if}
			</div>
		</div>
		<div class="flex flex-[initial] grow flex-col overflow-y-auto rounded px-3.5">
			<!-- scroll  -->
			<div class="flex flex-col gap-6">
				<div class="flex flex-col">
					<SidebarLink class="font-medium" href="/">
						<Tray weight="duotone" class="mr-1.5 h-4  w-4 text-accent" />
						Inbox
						<span class="ml-auto text-sm text-muted-foreground/85">{$inboxCount}</span></SidebarLink
					>
				</div>
				<div class="flex flex-col">
					<SidebarLink class="font-medium" href="/today">
						<Star weight="fill" class="mr-1.5 h-4 w-4 text-yellow-400" />
						Today
						<span class="ml-auto text-sm text-muted-foreground/85">{$todayCount}</span>
					</SidebarLink>
				</div>
				<div class="flex flex-col">
					{#each $lists as list}
						<SidebarLink href="/list/{list.id}">
							{list.name}
						</SidebarLink>
					{/each}
				</div>
			</div>
		</div>
		<div class="flex justify-between border-t px-3.5 py-2">
			<Button href="/list/new" variant="ghostOutline" class="text-sm text-muted-foreground">
				<Plus class="mr-1.5" />
				New list
			</Button>
			<Button
				on:click={async e => {
					if (e.metaKey || e.ctrlKey || innerWidth < 640) return

					e.preventDefault()
					if (e.currentTarget instanceof HTMLAnchorElement) {
						const { href } = e.currentTarget

						const result = await preloadData(href)

						if (result.type === 'loaded' && result.status === 200) {
							pushState(href, {})
							settingsOpen = true
						} else {
							goto(href)
						}
					}
				}}
				href="/settings"
				variant="ghostOutline"
				size="icon"
				class="text-muted-foreground"
			>
				<SlidersHorizontal class="h-4 w-4" />
				<span class="sr-only">Preferences</span>
			</Button>
		</div>
	</nav>
</div>

<Dialog.Root
	bind:open={settingsOpen}
	onOpenChange={open => {
		if (!open) history.back()
	}}
>
	<!-- Move to provider -->
	<Dialog.Content class="p-1">
		<Settings />
	</Dialog.Content>
</Dialog.Root>
