<script lang="ts">
	import { page } from '$app/stores'
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from '../../replicache'

	const rep = getReplicache()

	const s = TodoStore.get.watch(
		() => rep,
		() => [$page.params.id]
	)()

	rep.query(async tx => {
		const entries = await tx.scan().entries().toArray()
		console.log({ entries })
	})

	$: console.log({ $s })

	let form: HTMLFormElement
</script>

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
>
	<label>
		Completed
		<input type="checkbox" checked={!!$s?.completed} name="completed" />
	</label>
	<input type="text" value={$s?.text} name="text" />

	<button>Save</button>
</form>
