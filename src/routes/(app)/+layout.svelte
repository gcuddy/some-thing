<script lang="ts">
	import type { LayoutData } from './$types'
	import { setReplicache } from './replicache'

	export let data: LayoutData

	if (data.replicache) setReplicache(data.replicache)
</script>

{#if data.replicache}
	<slot />
{/if}
