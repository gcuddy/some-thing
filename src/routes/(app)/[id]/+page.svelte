<script lang="ts">
	import { page } from '$app/stores'
	import { TodoStore } from '$lib/data/todo'
	import { getReplicache } from '../replicache'

	const rep = getReplicache()

	const s = TodoStore.get.watch(
		() => rep,
		() => [$page.params.id]
	)()

	let form: HTMLFormElement
</script>

{JSON.stringify($s)}

<form
	bind:this={form}
	on:submit={async e => {
		e.preventDefault()
		const data = new FormData(form)

		const text = String(data.get('text') ?? '')
		const completed = Boolean(data.get('completed'))

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
		<input type="checkbox" checked={$s?.completed} name="completed" />
	</label>
	<input type="text" value={$s?.text} name="text" />

	<button>Save</button>
</form>
