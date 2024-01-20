<script lang="ts">
	import { page } from '$app/stores'
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from '../../replicache'

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
</script>

{#if $ready}
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
			<div class="flex items-start gap-2.5 w-full grow">
				<label class="sr-only" for="completed"> Completed </label>
				<input
					type="checkbox"
					class="flex mt-2 self-start"
					id="completed"
					checked={!!$s?.completed}
					name="completed"
				/>
				<div class="flex flex-col flex-1">
					<input type="text" class="text-xl font-medium" value={$s?.text} name="text" />
					<textarea placeholder="Notes" />
				</div>
			</div>

			<!-- TODO: metadata like date, tags, etc -->

			<noscript>
				<button>Save</button>
			</noscript>
		</form>
	</div>
{/if}
