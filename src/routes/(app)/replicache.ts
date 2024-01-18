import { TodoStore } from '$lib/data/todo'
import { Client } from '$lib/replicache/framework'
import type { ServerType } from '$lib/replicache/server'
import { Replicache } from 'replicache'
import { getContext, setContext } from 'svelte'

const s = '__replicache'

const mutators = new Client<ServerType>()
	.mutation('todo_create', async (tx, text) => {
		const id = Math.random().toString(36).slice(2)
		await TodoStore.put(tx, [id], {
			completed: false,
			id,
			text
		})
	})
	.mutation('todo_update', async (tx, { id: ids, data }) => {
		console.log('todo_update', ids, data)
		for (const id of ids) {
			await TodoStore.update(tx, id, todo => {
				return { ...todo, ...data }
				// console.log({ todo })
			})
		}
	})
	.mutation('todo_delete', async (tx, ids) => {
		for (const id of ids) {
			await TodoStore.remove(tx, id)
		}
	})
	.build()

export function createReplicache() {
	const replicache = new Replicache({
		name: 'user42',
		licenseKey: 'ld43a69e6baa14a1a85eb6bb09661739e',
		indexes: {
			id: {
				allowEmpty: true,
				jsonPointer: '/id'
			}
		},
		mutators
	})

	return replicache
}

export type ReplicacheType = ReturnType<typeof createReplicache>

export function getReplicache() {
	const replicache = getContext(s)

	if (!replicache) {
		throw new Error('Replicache not found')
	}

	// TODO actual typings lol
	return replicache as ReplicacheType
}

export function setReplicache(replicache: Replicache) {
	setContext(s, replicache)
}
