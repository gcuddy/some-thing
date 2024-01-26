<script lang="ts">
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import * as Select from '$lib/components/ui/select'
	import { Button } from '@/components/ui/button'
	import { capitalize } from '@/util/capitalize'

	import { setMode, mode, resetMode } from 'mode-watcher'
	import { updateReplicache } from '../../../replicache'

	const items: {
		label: string
		value: 'light' | 'dark' | 'system'
	}[] = [
		{ label: 'Light', value: 'light' },
		{ label: 'Dark', value: 'dark' },
		{ label: 'System', value: 'system' }
	]

	// account, generalj
</script>

<div class="flex flex-col gap-1">
	<span>Your user ID:</span>
	<div class="w-fit rounded-lg bg-secondary p-1 text-secondary-foreground">
		<span class="cursor-text select-text">{$page.data.userId}</span>
	</div>

	<form method="post" use:enhance action="/settings/general?/logout">
		<Button size="sm" type="submit">Logout</Button>
	</form>
</div>

<!-- <form
	use:enhance={() => {
		return async ({ update }) => {
			await update()
			updateReplicache()
		}
	}}
	method="post"
	action="/settings/general?/changeUserId"
>
	User Id:
	<input name="userId" type="text" value={$page.data.userId} />
	<Button type="submit">Change</Button>
</form> -->

<div class="flex items-center gap-4">
	<span class="">Appearance</span>
	<Select.Root
		onSelectedChange={change => {
			if (!change) {
				resetMode()
			} else if (change.value) {
				setMode(change.value)
			} else {
				resetMode()
			}
		}}
		selected={{
			value: $mode,
			label: $mode ? capitalize($mode) : 'System'
		}}
		{items}
	>
		<Select.Trigger class="w-48">
			<Select.Value placeholder="Select appearance" />
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each items as { label, value }}
					<Select.Item {label} {value}>{label}</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
