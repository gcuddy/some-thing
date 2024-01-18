import type { Replicache } from 'replicache'
import { getContext, setContext } from 'svelte'

const s = '__replicache'

export function getReplicache() {
	const replicache = getContext(s)

	if (!replicache) {
		throw new Error('Replicache not found')
	}

	// TODO actual typings lol
	return replicache as Replicache
}

export function setReplicache(replicache: Replicache) {
	setContext(s, replicache)
}
