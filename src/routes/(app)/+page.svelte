<script lang="ts">
	import { getContext } from 'svelte'
	import Todo from './Todo.svelte'
	import type { Replicache } from 'replicache'
	import type { Snapshot } from './$types'
	const rep = getContext('__replicache') as Replicache
	console.log({ rep })

	let todo: Todo

	export const snapshot: Snapshot = {
		capture: () => todo.snapshot.capture(),
		restore: data => todo.snapshot.restore(data)
	}
</script>

<div class="grow mx-auto w-[calc(100%)]">
	<!-- <h1>todos</h1> -->
	<Todo bind:this={todo} />
</div>
