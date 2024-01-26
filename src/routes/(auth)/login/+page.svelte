<script lang="ts">
	import { enhance } from '$app/forms'
	import { goto } from '$app/navigation'
	import { Button } from '@/components/ui/button'
	import { Input } from '@/components/ui/input'
	import { Label } from '@/components/ui/label'
</script>

<div class="grid h-screen w-screen place-content-center gap-4">
	<div class="flex w-full max-w-md flex-col gap-4">
		<span class="text-lg font-bold tracking-tight">Login or Create User ID</span>
		<form
			use:enhance={() => {
				return async ({ update }) => {
					await update()
					await goto('/')
				}
			}}
			class="flex flex-col gap-2"
			method="post"
			action="/settings/general?/changeUserId"
		>
			<div class="flex flex-col gap-1">
				<Label for="userId">User ID</Label>
				<Input id="userId" type="text" placeholder="abc123" name="userId" />
			</div>
			<div class="flex justify-end">
				<Button class="font-bold" type="submit" variant="accent">Login</Button>
			</div>
		</form>
	</div>
</div>
