<script lang="ts">
	import autosize from '$lib/actions/autosize'
	import type { Todo } from '@/core/todo'
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'
	import DatePicker from './ui/date-picker.svelte'

	export let todo: Pick<Todo, 'text' | 'notes' | 'completed'>
	export let autofocus: true | undefined = undefined
	let form: HTMLFormElement
	let textInput: HTMLInputElement
	let textarea: HTMLTextAreaElement

	const dispatch = createEventDispatcher<{
		submit: {
			text: string
			notes: string
			completed: Date | null
		}
	}>()

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

<form
	bind:this={form}
	on:submit={() => {
		dispatch('submit', {
			text: todo.text ?? '',
			notes: todo.notes ?? '',
			completed: todo.completed
		})
	}}
	class="flex flex-col"
>
	<div class="flex w-full grow items-start gap-2.5 overflow-auto rounded p-4">
		<label class="sr-only" for="completed"> Completed </label>
		<!-- svelte-ignore a11y-autofocus -->
		<input
			{autofocus}
			type="checkbox"
			class="mt-2 flex self-start"
			id="completed"
			checked={!!todo.completed}
			name="completed"
			on:change={e => {
				todo.completed = e.currentTarget.checked ? new Date() : null
			}}
		/>
		<div class="flex flex-1 flex-col gap-0.5">
			<input
				data-todo-input
				bind:this={textInput}
				type="text"
				on:blur
				class="text-xl font-medium focus-visible:outline-none focus-visible:ring-0"
				bind:value={todo.text}
				name="text"
				placeholder="New to-do"
				on:keydown={e => {
					console.log({ mounted })
					if (e.key === 'Enter' && mounted) {
						e.preventDefault()
						// await handleChange(e)
						dispatch('submit', {
							text: todo.text ?? '',
							notes: todo.notes ?? '',
							completed: todo.completed
						})
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
				bind:value={todo.notes}
				name="notes"
				use:autosize
				on:blur
				placeholder="Notes"
				class="focus-visible:outline-none"
				on:keydown={async e => {
					if (e.key === 'Enter' && e.metaKey) {
						e.preventDefault()
						dispatch('submit', {
							text: todo.text ?? '',
							notes: todo.notes ?? '',
							completed: todo.completed
						})
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
			<div class="flex">
				<DatePicker />
			</div>
		</div>
	</div>

	<!-- TODO: metadata like date, tags, etc -->

	<noscript>
		<button>Save</button>
	</noscript>
</form>
