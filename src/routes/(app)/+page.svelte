<script lang="ts">
	import { getContext } from 'svelte'
	import Todo from './Todo.svelte'
	import type { Replicache } from 'replicache'
	const rep = getContext('__replicache') as Replicache
	console.log({ rep })
</script>

<div class="wrapper">
	<!-- <h1>todos</h1> -->
	<Todo />
</div>

<style>
	.wrapper {
		margin: 0 auto;
		max-width: 35rem;
		width: 100%;
	}
	.wrapper h1 {
		font-size: 3rem;
		font-weight: 500;
		text-align: center;
		letter-spacing: -0.02em;
		/* color: #ff2d55; */
	}
</style>
