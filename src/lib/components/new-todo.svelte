<script lang="ts">
	import TodoDetail from './todo-detail.svelte'
</script>

<TodoDetail
	on:submit
    autofocus
	todo={{
		completed: null,
		notes: '',
		text: ''
	}}
/>
