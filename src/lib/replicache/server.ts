import * as Todo from '$lib/core/todo'
import { Server } from './framework'

export const server = new Server()
	.expose('todo_create', Todo.create)
	.expose('todo_createmany', Todo.createMany)
	.expose('todo_update', Todo.update)
	.expose('todo_delete', Todo.remove)

export type ServerType = typeof server
