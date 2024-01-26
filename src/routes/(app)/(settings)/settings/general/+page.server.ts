import { redirect } from '@sveltejs/kit'

export const actions = {
	async changeUserId({ request, cookies }) {
		const data = await request.formData()

		const userId = data.get('userId')

		if (userId && typeof userId === 'string' && userId.length > 0) {
			cookies.set('userId', userId, {
				path: '/'
			})
		}
	},
	async logout({ cookies }) {
		cookies.delete('userId', {
			path: '/'
		})

		return redirect(300, '/login')
	}
}
