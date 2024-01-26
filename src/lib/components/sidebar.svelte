<script lang="ts" context="module">
	export const selected = writable<string[]>([])

	export function getSelected() {
		const s = getContext('sidebar_selected')
		if (!s) throw new Error('sidebar_selected not found')
		return s as typeof selected
	}
</script>

<script lang="ts">
	import { syncing } from '$lib/stores/sync'
	import autoAnimate from '@formkit/auto-animate'
	import {
		Calendar,
		CircleHalf,
		Cloud,
		Cube,
		ListChecks,
		Plus,
		SlidersHorizontal,
		Star,
		Tray
	} from 'phosphor-svelte'

	import { goto, preloadData, pushState } from '$app/navigation'
	import * as Dialog from '$lib/components/ui/dialog'
	import { ListStore } from '@/data/list'
	import { TodoStore } from '@/data/todo'
	import { sortIndexes } from '@/util/sort'
	import { flyAndScale } from '@/util/style'
	import { getContext, setContext } from 'svelte'
	import { derived, writable } from 'svelte/store'
	import Settings from '../../routes/(app)/(settings)/settings/general/+page.svelte'
	import { type ReplicacheType } from '../../routes/(app)/replicache'
	import { filterFn } from '../../routes/(app)/today/filter'
	import SidebarDragRegion from './sidebar-drag-region.svelte'
	import SidebarLink from './sidebar-link.svelte'
	import Button from './ui/button/button.svelte'
	import * as DropdownMenu from './ui/dropdown-menu'
	import { settingsOpen } from '@/stores/settings'

	export let rep: ReplicacheType
	export let userId: string
	setContext('sidebar_selected', selected)

	const lists = ListStore.list.watch(
		() => rep,
		() => []
	)()

	// sort by index, put lists without parent (area) first, then list areas with their children

	const parentlessLists = derived(lists, lists =>
		lists.filter(list => !list.areaId && list.type !== 'area').sort(sortIndexes)
	)

	$: console.log({ $parentlessLists })
	const areasAndChildren = derived(lists, lists => {
		const areas = lists.filter(list => list.type === 'area').sort(sortIndexes)
		const children = lists.filter(list => list.areaId).sort(sortIndexes)
		return areas.map(area => {
			return {
				...area,
				children: children.filter(child => child.areaId === area.id)
			}
		})
	})

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

	function selectedMutationObserver(node: HTMLElement) {
		const observer = new MutationObserver(cl => {
			// actually just use node selector
			const nodes = Array.from(
				node.querySelectorAll<HTMLElement>('[data-sidebar-list-item][data-selected=true]')
			)
				.map(c => c.dataset.id)
				.filter(Boolean)
			selected.set(nodes as string[])
		})
		observer.observe(node, {
			attributes: true,
			childList: true,
			subtree: true,
			attributeFilter: ['data-selected']
		})
		return {
			destroy() {
				observer.disconnect()
			}
		}
	}
</script>

<div class="fixed bottom-0 left-0 top-0 w-60">
	<nav class="relative flex h-full flex-col border-r bg-secondary">
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
					<SidebarLink class="font-medium" href="/upcoming">
						<Calendar weight="fill" class="mr-1.5 h-4 w-4 text-red-400" />
						Upcoming
					</SidebarLink>
				</div>
				<div use:autoAnimate use:selectedMutationObserver class="flex flex-col gap-4">
					<SidebarDragRegion multiSelectable lists={$parentlessLists} />
					<SidebarDragRegion
						multiSelectable={false}
						type="area"
						class="gap-2"
						lists={$areasAndChildren}
					/>
				</div>
			</div>
		</div>
		<div class="flex justify-between border-t px-3.5 py-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghostOutline" class="text-sm text-muted-foreground">
						<Plus class="mr-1.5" />
						New list
					</Button></DropdownMenu.Trigger
				>
				<DropdownMenu.Content
					class="w-80"
					transition={flyAndScale}
					transitionConfig={{
						y: 8
					}}
				>
					<DropdownMenu.Item href="/list/new?type=project" class="group">
						<div class="flex items-center">
							<CircleHalf
								weight="fill"
								class="relative top-0.5 mr-1.5 h-4 w-4 shrink-0 self-start text-accent group-data-[highlighted]:text-white/75"
							/>
							<div class="flex flex-col">
								<span class="font-medium">New Project</span>
								<span
									class="font-medium text-muted-foreground group-data-[highlighted]:text-white/50"
									>Define a goal, then work toward it one to-do at a time.</span
								>
							</div>
						</div></DropdownMenu.Item
					>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="group" href="/list/new?type=list">
						<div class="flex items-center">
							<ListChecks
								weight="bold"
								class="relative top-0.5 mr-1.5 h-4 w-4 shrink-0 self-start text-gray-400 group-data-[highlighted]:text-white/75"
							/>
							<div class="flex flex-col">
								<span class="font-medium">New List</span>
								<span
									class="font-medium text-muted-foreground group-data-[highlighted]:text-white/50"
									>Collect loosely related to-dos together in a list.
								</span>
							</div>
						</div></DropdownMenu.Item
					>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="group" href="/list/new?type=area">
						<div class="flex items-center">
							<Cube
								weight="bold"
								class="relative top-0.5 mr-1.5 h-4 w-4 shrink-0 self-start text-emerald-400 group-data-[highlighted]:text-white/75"
							/>
							<div class="flex flex-col">
								<span class="font-medium">New Area</span>
								<span
									class="font-medium text-muted-foreground group-data-[highlighted]:text-white/50"
									>Group your projects and to-dos by area of responsibility, such as Family or Work.
								</span>
							</div>
						</div></DropdownMenu.Item
					>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<Button
				on:click={async e => {
					if (e.metaKey || e.ctrlKey || innerWidth < 640) return

					e.preventDefault()
					if (e.currentTarget instanceof HTMLAnchorElement) {
						const { href } = e.currentTarget

						const result = await preloadData(href)

						if (result.type === 'loaded' && result.status === 200) {
							pushState(href, {})
							settingsOpen.set(true)
						} else {
							goto(href)
						}
					}
				}}
				href="/settings/general"
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
	bind:open={$settingsOpen}
	onOpenChange={open => {
		if (!open) history.back()
	}}
>
	<!-- Move to provider -->
	<Dialog.Content class="">
		<Settings />
	</Dialog.Content>
</Dialog.Root>
