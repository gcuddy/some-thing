import { browser } from '$app/environment'
import { createReplicache } from './replicache'

export const ssr = false

export async function load() {
	console.log('load layout')
    console.log('browser', browser)
	if (browser) {
		console.log('load layout browser')
		const replicache = createReplicache()
		return {
			replicache
		}
	}
}
