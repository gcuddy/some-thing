import { browser } from '$app/environment'
import { createReplicache } from './replicache'

export async function load() {
	console.log('load layout')
	if (browser) {
		console.log('load layout browser')
		const replicache = createReplicache()
		return {
			replicache
		}
	}
}
