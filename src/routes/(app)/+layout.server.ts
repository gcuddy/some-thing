import { createId } from '@/util/nanoid'
import { redirect } from '@sveltejs/kit'

export async function load({ cookies }) {
	const userId = cookies.get('userId')

	if (!userId) {
		const id = createId()
		cookies.set('userId', id, {
			path: '/'
		})
		return {
			userId: id
		}
	} else {
		return {
			userId
		}
	}
}
