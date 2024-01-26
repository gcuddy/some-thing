import { browser } from '$app/environment'
import { createReplicache } from './replicache'

export const ssr = false

export async function load({ data }) {
	console.log('load layout')
	console.log('browser', browser)
	if (browser) {
		console.log('load layout browser')
		const replicache = createReplicache({
			userId: data.userId
		})
		return {
			replicache,
			...data
		}
	} else {
		return {
			...data
		}
	}
}
