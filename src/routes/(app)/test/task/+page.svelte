<script lang="ts">
	import { TodoStore } from '@/data/todo'
	import Task from './task.svelte'
	import { AnimateSharedLayout, Motion } from 'svelte-motion'
	import { flip } from 'svelte/animate'

	export let data

	let todos: ReturnType<ReturnType<typeof TodoStore.list.watch>>

	$: if (data.replicache)
		todos = TodoStore.list.watch(
			() => data.replicache!,
			() => []
		)()
</script>

{#if data.replicache}
	<AnimateSharedLayout>
		<Motion let:motion layout initial>
			<div use:motion class="flex w-full flex-col px-9">
				{#each $todos as todo (todo.id)}
					<Task text={todo.text} />
				{/each}
			</div>
		</Motion>
	</AnimateSharedLayout>
{/if}
