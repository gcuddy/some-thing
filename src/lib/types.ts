import type { Todo } from './core/todo'

export type FilterFn<T> = (item: T) => boolean

export type TodoFilterFn = FilterFn<Todo>
