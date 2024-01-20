<script lang="ts">
	import { page } from '$app/stores'
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from '../../replicache'
	import autosize from '$lib/actions/autosize'

	const rep = getReplicache()

	const s = TodoStore.get.watch(
		() => rep,
		() => [$page.params.id]
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
				id: [$page.params.id],
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
				id: [$page.params.id],
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
	<div class="max-w-4xl relative w-[calc(100%-120px)] mx-auto grow shrink-0 h-full">
		<form
			bind:this={form}
			on:submit={async e => {
				e.preventDefault()
				const data = new FormData(form)

				const text = String(data.get('text') ?? '')
				const completed = Boolean(data.get('completed')) ? new Date() : null

				await rep.mutate.todo_update({
					id: [$page.params.id],
					data: {
						text,
						completed
					}
				})
			}}
			class="flex flex-col"
		>
			<div
				class="flex items-start gap-2.5 w-full grow overflow-auto focus-within:ring-1 focus-within:ring-black/5 rounded p-4"
			>
				<label class="sr-only" for="completed"> Completed </label>
				<input
					type="checkbox"
					class="flex mt-2 self-start"
					id="completed"
					checked={!!$s?.completed}
					name="completed"
					on:change={handleChange}
				/>
				<div class="flex flex-col gap-0.5 flex-1">
					<input
						type="text"
						on:blur={handleChange}
						autofocus
						class="text-xl font-medium focus-visible:ring-0 focus-visible:outline-none"
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
	</div>
{/if}
