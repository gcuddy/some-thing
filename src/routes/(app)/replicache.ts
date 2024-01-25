import { TodoStore } from '$lib/data/todo'
import { Client } from '$lib/replicache/framework'
import type { ServerType } from '$lib/replicache/server'
import { syncing } from '$lib/stores/sync'
import { createId } from '$lib/util/nanoid'
import { ListStore } from '@/data/list'
import { Replicache } from 'replicache'
import { getContext, setContext } from 'svelte'

const s = '__replicache'

const mutators = new Client<ServerType>()
	.mutation('todo_createmany', async (tx, data) => {
		for (const todo of data) {
			const id = todo.id ?? createId()
			console.log({ id })
			await TodoStore.put(tx, [id], {
				completed: null,
				archivedAt: null,
				id,
				...todo
			})
		}
	})
	.mutation('todo_create', async (tx, data) => {
		const id = data.id ?? createId()
		// const todos = await TodoStore.list(tx)

		// console.log('todo_create', { id, data, todos })
		// //  get min index
		// const index =
		// 	data.index ??
		// 	todos.reduce((min, todo) => {
		// 		const index = todo.index ?? 0
		// 		if (index < min) {
		// 			return index
		// 		}
		// 		return min
		// 	}, 0) - 1

		// console.log('mutator', { index })

		await TodoStore.put(tx, [id], {
			...data,
			completed: null,
			id,
			text: data.text,
			archivedAt: null
			// index
		})
	})
	.mutation('todo_update', async (tx, { id: ids, data }) => {
		console.log('todo_update', { ids, data })
		for (const id of ids) {
			await TodoStore.update(tx, id, todo => {
				return { ...todo, ...data }
			})
		}
	})
	.mutation('todo_delete', async (tx, input) => {
		for (const id of input.ids) {
			if (input.archive) {
				await TodoStore.update(tx, id, todo => ({ ...todo, archivedAt: new Date() }))
			} else {
				await TodoStore.remove(tx, id)
			}
		}
	})
	.mutation('list_create', async (tx, input) => {
		const id = input.id ?? createId()
		let { index, ...rest } = input
		if (index === undefined || index === null) {
			const lists = await ListStore.list(tx)
			index =
				lists.reduce((min, list) => {
					const index = list.index ?? 0
					if (index < min) {
						return index
					}
					return min
				}, 0) - 100
			console.log('list_create', { index })
		}
		await ListStore.put(tx, [id], {
			id,
			...rest,
			index
		})
	})
	.mutation('list_update', async (tx, { id: ids, data }) => {
		for (const id of ids) {
			console.log('list_update', { id, data })
			await ListStore.update(tx, id, list => ({ ...list, ...data }))
		}
	})
	.mutation('list_delete', async (tx, input) => {
		for (const id of input) {
			await ListStore.remove(tx, id)
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
		pushURL: '/api/party?push',
		pullURL: '/api/party?pull',
		mutators,
		// higher speed for testing
		pullInterval: 1000 * 5
		// pushDelay: 1000 * 2
	})

	replicache.onSync = s => syncing.set(s)

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
