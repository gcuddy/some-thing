<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { recents } from '@/components/goto/store'
	import type { Replicache } from 'replicache'
	import { getContext } from 'svelte'
	import Todo from '../Todo.svelte'
	import type { Snapshot } from './$types'
	import { filterFn } from './filter'
	import { Star } from 'phosphor-svelte'
	const rep = getContext('__replicache') as Replicache
	console.log({ rep })

	let todo: Todo

	export const snapshot: Snapshot = {
		capture: () => todo.snapshot.capture(),
		restore: data => todo.snapshot.restore(data)
	}

	afterNavigate(() => {
		recents.add('Today')
	})
</script>

<div class="mx-auto w-[calc(100%)] grow">
	<Todo showDates={false} bind:this={todo} {filterFn}>
		<div slot="header">
			<div class="flex items-center gap-2">
				<Star class="h-6 w-6 text-yellow-400" weight="fill" />
				<h1 class="text-2xl font-semibold tracking-tight">Today</h1>
			</div>
		</div>
	</Todo>
</div>
