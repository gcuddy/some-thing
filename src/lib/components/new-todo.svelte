<script lang="ts">
	import TodoDetail from './todo-detail.svelte'
</script>

<TodoDetail
	on:submit
	todo={{
		completed: null,
		notes: '',
		text: ''
	}}
/>
