import * as Todo from '$lib/core/todo'
import * as List from '$lib/core/list'
import { Server } from './framework'

export const server = new Server()
	.expose('todo_create', Todo.create)
	.expose('todo_createmany', Todo.createMany)
	.expose('todo_update', Todo.update)
	.expose('todo_delete', Todo.remove)
	.expose('list_create', List.create)
	.expose('list_update', List.update)
	.expose('list_delete', List.remove)

export type ServerType = typeof server
