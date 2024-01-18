<script lang="ts">
	import { getContext } from 'svelte'
	import Todo from './Todo.svelte'
	import type { Replicache } from 'replicache'
	const rep = getContext('__replicache') as Replicache
	console.log({ rep })
</script>

<Todo />
