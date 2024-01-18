<script lang="ts">
	import { TodoStore } from '$lib/data/todo'
	import type { Replicache } from 'replicache'
	import { getReplicache } from './replicache-ctx'
	export let rep: Replicache
	// const rep = getReplicache()
	const t = TodoStore.list.watch(
		() => rep,
		() => []
	)()
	const ready = t.ready
	console.log({ ready })

    let newTodo = ''
</script>

{$ready}
<form on:submit|preventDefault={() => {

}}>
	<input bind:value={newTodo} type="text" />
	<button>Add</button>
</form>

{JSON.stringify($t)}
{#each $t as todo}
	<div>
		<input type="checkbox" checked={todo.done} />
		{todo.text}
	</div>
{/each}
