<script lang="ts">
	import { page } from '$app/stores'
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from '../../replicache'
	import autosize from '$lib/actions/autosize'
	import { receive, send } from '$lib/util/transition'

	export let data

	const rep = getReplicache()

	const s = TodoStore.get.watch(
		() => rep,
		() => [data.id]
	)()

	const ready = s.ready

	rep.query(async tx => {
		const entries = await tx.scan().entries().toArray()
		console.log({ entries })
	})

	$: console.log({ $s })

	let form: HTMLFormElement

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
</script>

{#if $ready && $s}

		<form
			bind:this={form}
			on:submit={async e => {
				e.preventDefault()
				const formData = new FormData(form)

				const text = String(formData.get('text') ?? '')
				const completed = Boolean(formData.get('completed')) ? new Date() : null

				await rep.mutate.todo_update({
					id: [data.id],
					data: {
						text,
						completed
					}
				})
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
						in:send={{ key: `todo-${$s.id}` }}
						out:receive={{ key: `todo-${$s.id}` }}
						type="text"
						on:blur={handleChange}
						autofocus
						class="text-xl font-medium focus-visible:outline-none focus-visible:ring-0"
						value={$s?.text}
						name="text"
					/>
					<textarea
						value={$s?.notes}
						name="notes"
						use:autosize
						on:blur={handleChange}
						placeholder="Notes"
						class="focus-visible:outline-none"
					/>
				</div>
			</div>

			<!-- TODO: metadata like date, tags, etc -->

			<noscript>
				<button>Save</button>
			</noscript>
		</form>
{/if}
