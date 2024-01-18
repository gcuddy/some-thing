import { browser } from '$app/environment'
import { TodoStore } from '$lib/data/todo'
import { Replicache, type WriteTransaction } from 'replicache'
import { createReplicache } from './replicache'

export async function load() {
	if (browser) {
		const replicache = createReplicache()
		return {
			replicache
		}
	}
}
