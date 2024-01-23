import { browser } from '$app/environment'
import { ListStore } from '@/data/list'

export async function load({ params, parent }) {
	const data = await parent()

	if (data.replicache && browser) {
		return {
			list: ListStore.get.watch(
				() => data.replicache,
				() => [params.id]
			)()
		}
	}
	return {
		id: params.id
	}
}
