<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { recents } from '@/components/goto/store'
	import type { Replicache } from 'replicache'
	import { getContext } from 'svelte'
	import Todo from '../Todo.svelte'
	import type { Snapshot } from './$types'
	import { filterFn } from './filter'
	const rep = getContext('__replicache') as Replicache
	console.log({ rep })

	let todo: Todo

	export const snapshot: Snapshot = {
		capture: () => todo.snapshot.capture(),
		restore: data => todo.snapshot.restore(data)
	}

	afterNavigate(() => {
		recents.add('Upcoming')
	})
</script>

<div class="mx-auto w-[calc(100%)] grow">
	<!-- <h1>todos</h1> -->
	<Todo bind:this={todo} {filterFn} />
</div>
