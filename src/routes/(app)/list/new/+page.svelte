<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'

	import autosize from '$lib/actions/autosize'
	import { DotsThree } from 'phosphor-svelte'

	export let data;


	let notesTextarea: HTMLTextAreaElement
	let textInput: HTMLTextAreaElement

	let created = false
</script>

<div class="flex h-full w-full shrink grow flex-col px-16 pt-10">
	<div class="flex items-center gap-2">
		<input type="checkbox" class="text-lg" />
		<textarea
			bind:this={textInput}
			class="flex-1 py-1 text-2xl font-semibold focus-visible:outline-none"
			autofocus
			on:blur={async e => {
				if (!created && e.currentTarget.value.trim()) {
					created = true
					await data.replicache?.mutate.list_create({
						name: e.currentTarget.value.trim()
					})
				}
			}}
			on:keydown={e => {
				if (e.key === 'Enter') {
					e.preventDefault()
					e.currentTarget.blur()
				}
				if (e.key === 'ArrowDown') {
					e.preventDefault()
					notesTextarea?.focus()
				}
			}}
			use:autosize
			rows={1}
			placeholder="New List"
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<DotsThree class="h-6 w-6" />
				<span class="sr-only">Open menu</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Group>
					<DropdownMenu.Label>My Account</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Profile</DropdownMenu.Item>
					<DropdownMenu.Item>Billing</DropdownMenu.Item>
					<DropdownMenu.Item>Team</DropdownMenu.Item>
					<DropdownMenu.Item>Subscription</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div>
		<textarea
			on:keydown={e => {
				if (e.key === 'ArrowUp') {
					if (e.currentTarget.selectionStart === 0) {
						e.preventDefault()
						textInput?.focus()
					}
				}
			}}
			bind:this={notesTextarea}
			class="flex-1 py-1 text-sm focus-visible:outline-none"
			use:autosize
			placeholder="Notes"
		/>
	</div>
</div>

<style>
	input[type='checkbox'] {
		@apply h-5 w-5 rounded-full border-2 border-blue-700;
	}
</style>
