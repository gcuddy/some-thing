<script lang="ts">
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from '../../replicache'
	import autosize from '$lib/actions/autosize'
	import { receive, send } from '$lib/util/transition'
	import { createEventDispatcher, onDestroy, onMount, type ComponentType } from 'svelte'
	import DatePicker from '@/components/ui/date-picker.svelte'
	import {
		DateFormatter,
		fromDate,
		getLocalTimeZone,
		today,
		isSameDay,
		isSameYear
	} from '@internationalized/date'
	import { Calendar, CalendarPlus, Star } from 'phosphor-svelte'
	import { cn } from '@/util/style'
	import { formatDate } from '@/util/date'

	export let data

	let isDatePickerOpen = false

	const rep = getReplicache()

	const s = TodoStore.get.watch(
		() => rep,
		() => [data.id]
	)()

	// if (!$s) {
	//     throw new Error('no $s')
	// }

	const ready = s.ready

	rep.query(async tx => {
		const entries = await tx.scan().entries().toArray()
		console.log({ entries })
	})

	$: console.log({ $s })

	let form: HTMLFormElement
	let textInput: HTMLInputElement
	let textarea: HTMLTextAreaElement

	const dispatch = createEventDispatcher()

	async function handleChange(e: Event) {
		if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
			const checked = Boolean(e.target.checked)
			console.log({ checked })
			return await rep.mutate.todo_update({
				id: [data.id],
				data: {
					completed: checked ? new Date() : null
				}
			})
		}
		if (
			(e.target instanceof HTMLInputElement && e.target.type === 'text') ||
			e.target instanceof HTMLTextAreaElement
		) {
			const text = String(e.target.value)
			const key = e.target.name as 'text' | 'notes'

			if (text === $s?.[key]) return console.log('no change')
			return await rep.mutate.todo_update({
				id: [data.id],
				data: {
					[key]: text
				}
			})

			// return await rep.mutate.todo_update({
			// 	id: [$page.params.id],
			// 	data: {
			// 		text
			// 	}
			// })
		}
	}

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

	export function getState() {
		const formData = new FormData(form)

		const text = String(formData.get('text') ?? '')
		const completed = Boolean(formData.get('completed')) ? new Date() : null

		return { text, completed }
	}
</script>

<svelte:window
	on:keydown={e => {
		if (e.key === 's' && e.metaKey) {
			e.preventDefault()
			e.stopPropagation()
			e.stopImmediatePropagation()
			// dispatch('submit')
			isDatePickerOpen = true
		}
	}}
/>

{#if $ready}
	<form
		bind:this={form}
		on:submit={async e => {
			e.preventDefault()
			const { text, completed } = getState()

			// submit if there's a difference

			await rep.mutate.todo_update({
				id: [data.id],
				data: {
					text,
					completed
				}
			})

			dispatch('submit')
		}}
		class="flex flex-col"
	>
		<div class="flex w-full grow items-start gap-2.5 overflow-auto rounded p-4">
			<label class="sr-only" for="completed"> Completed </label>
			<input
				type="checkbox"
				class="mt-2 flex self-start"
				id="completed"
				checked={!!$s?.completed}
				name="completed"
				on:change={handleChange}
			/>
			<div class="flex flex-1 flex-col gap-0.5">
				<input
					data-todo-input
					bind:this={textInput}
					type="text"
					on:blur={handleChange}
					class="text-lg font-medium focus-visible:outline-none focus-visible:ring-0"
					value={$s?.text}
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
					value={$s?.notes}
					name="notes"
					use:autosize
					on:blur={handleChange}
					placeholder="Notes"
					class="text-sm focus-visible:outline-none"
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
				<div class="flex">
					<DatePicker
						value={$s?.startDate
							? fromDate(new Date($s?.startDate), getLocalTimeZone())
							: undefined}
						onChange={async date => {
							if (!$s?.startDate && !date) return
							if ($s?.startDate && new Date($s.startDate) === date) return
							await rep.mutate.todo_update({
								id: [data.id],
								data: {
									startDate: date ? date : null
								}
							})
						}}
						bind:open={isDatePickerOpen}
					>
						{#if !$s?.startDate}
							<div class={cn("flex items-center gap-1 p-1 rounded hover:bg-secondary", isDatePickerOpen && "bg-secondary")}>
								<CalendarPlus class="h-4 w-4 text-muted-foreground" />
								<span class="text-xs text-muted-foreground">When</span>
							</div>
						{:else}
							{@const { text, icon, props } = formatDate($s.startDate)}
							<div
								class={cn(
									'flex items-center rounded p-1 hover:bg-secondary',
									isDatePickerOpen && 'bg-secondary '
								)}
							>
								<svelte:component
									this={icon}
									{...props}
									class="mr-1.5 h-4 w-4 {props.class ?? ''}"
								/>
								<span class="text-sm">{text}</span>
							</div>
						{/if}
					</DatePicker>
				</div>
			</div>
		</div>

		<!-- TODO: metadata like date, tags, etc -->

		<noscript>
			<button>Save</button>
		</noscript>
	</form>
{/if}
<!-- {/if} -->
