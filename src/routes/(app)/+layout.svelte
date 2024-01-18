<script lang="ts">
	import type { LayoutData } from './$types'
	import { setReplicache } from './replicache-ctx'

	export let data: LayoutData

	if (data.replicache) setReplicache(data.replicache)
</script>

<slot />
