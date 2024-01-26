import type { List } from '@/core/list'
import type { Todo } from '@/core/todo'
import type { ComponentType } from 'svelte'

export type TodoItem = {
	type: 'todo'
	data: Todo
}

export type ListItem = {
	type: 'list'
	data: List
}

export type SpecialListItem = {
	type: 'special'
	data: {
		name: string
		keywords: string[]
		icon: ComponentType
		iconClass: string
		iconProps: Record<string, unknown>
		id: string
		href: string
		/**
		 * If fn is present, will be used instead of href
		 */
		fn?: () => void
	}
}

export type SearchItem = ListItem | TodoItem | SpecialListItem
