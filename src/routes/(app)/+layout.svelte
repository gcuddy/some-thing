<script lang="ts">
	import { Replicache } from 'replicache';
	import { onMount } from 'svelte';

	let rep: Replicache;

	onMount(() => {
		rep = new Replicache({
			name: 'user42',
			licenseKey: 'ld43a69e6baa14a1a85eb6bb09661739e'
		});


        rep.experimentalWatch((c) => {

        })
	});
</script>
