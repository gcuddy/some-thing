<script lang="ts">
	import { getContext } from 'svelte'
	import Todo from '../Todo.svelte'
	import type { Replicache } from 'replicache'
	import type { Snapshot } from './$types'
	import { fromDate, getLocalTimeZone, isToday } from '@internationalized/date'
	import { afterNavigate } from '$app/navigation'
	import { recents } from '@/components/goto/store'
	const rep = getContext('__replicache') as Replicache
	console.log({ rep })

	let todo: Todo

	export const snapshot: Snapshot = {
		capture: () => todo.snapshot.capture(),
		restore: data => todo.snapshot.restore(data)
	}

	const tz = getLocalTimeZone()

	afterNavigate(() => {
		recents.add('Today')
	})
</script>

<div class="mx-auto w-[calc(100%)] grow">
	<!-- <h1>todos</h1> -->
	<Todo
		bind:this={todo}
		filterFn={todo => {
			if (!todo.startDate) return false
			const date = fromDate(new Date(todo.startDate), tz)
			return isToday(date, tz)
		}}
	/>
</div>
