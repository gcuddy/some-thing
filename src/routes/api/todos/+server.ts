import { todos } from '@/core/todo/todo.sql'
import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

export async function GET({ url, locals }) {
	const listId = url.searchParams.get('listId') as string

	const t = await locals.DB.select().from(todos).where(eq(todos.listId, listId))

	return json(t)
}
