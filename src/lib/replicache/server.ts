import { createtodo, deletetodo, updatetodo } from '$lib/core/todo'
import { Server } from './framework'

export const server = new Server()
	.expose('todo_create', createtodo)
	.expose('todo_update', updatetodo)
	.expose('todo_delete', deletetodo)

export type ServerType = typeof server
