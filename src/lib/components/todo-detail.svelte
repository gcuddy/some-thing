<script lang="ts">
	import autosize from '$lib/actions/autosize'
	import type { Todo } from '@/core/todo'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'

	export let todo: Pick<Todo, 'text' | 'notes' | 'completed'>

	let form: HTMLFormElement
	let textInput: HTMLInputElement
	let textarea: HTMLTextAreaElement

	const dispatch = createEventDispatcher()

	let mounted = false

	onMount(() => {
		// wait for animations to finish
		setTimeout(() => {
			mounted = true
			// textInput?.focus()
		}, 200)
	})

	onDestroy(() => {
		console.log('destroy')
		mounted = false
	})
</script>

<form bind:this={form} on:submit class="flex flex-col">
	<div class="flex w-full grow items-start gap-2.5 overflow-auto rounded p-4">
		<label class="sr-only" for="completed"> Completed </label>
		<input
			type="checkbox"
			class="mt-2 flex self-start"
			id="completed"
			checked={!!todo.completed}
			name="completed"
			on:change
		/>
		<div class="flex flex-1 flex-col gap-0.5">
			<input
				data-todo-input
				bind:this={textInput}
				type="text"
				on:blur
				class="text-xl font-medium focus-visible:outline-none focus-visible:ring-0"
				value={todo.text}
				name="text"
				on:keydown={e => {
					console.log({ mounted })
					if (e.key === 'Enter' && mounted) {
						e.preventDefault()
						// await handleChange(e)
						dispatch('submit')
					}
					if (e.key === 'ArrowDown') {
						e.preventDefault()
						// move to textarea at top
						textarea?.focus()
						textarea?.setSelectionRange(0, 0)
					}
				}}
			/>
			<textarea
				bind:this={textarea}
				value={todo.notes}
				name="notes"
				use:autosize
				on:blur
				placeholder="Notes"
				class="focus-visible:outline-none"
				on:keydown={async e => {
					if (e.key === 'Enter' && e.metaKey) {
						e.preventDefault()
						dispatch('submit')
					}
					if (e.key === 'ArrowUp') {
						// check if we're at the top
						if (textarea?.selectionStart === 0) {
							e.preventDefault()
							textInput?.focus()
						}
					}
				}}
			/>
		</div>
	</div>

	<!-- TODO: metadata like date, tags, etc -->

	<noscript>
		<button>Save</button>
	</noscript>
</form>
