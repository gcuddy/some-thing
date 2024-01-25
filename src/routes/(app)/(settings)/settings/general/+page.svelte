<script lang="ts">
	import * as Select from '$lib/components/ui/select'
	import { capitalize } from '@/util/capitalize'

	import { setMode, mode, resetMode } from 'mode-watcher'

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
            label: $mode ? capitalize($mode) : "System"
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
