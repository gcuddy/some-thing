import type { ReadTransaction, Replicache, WriteTransaction } from 'replicache'
import { get, writable, type Writable } from 'svelte/store'

type PathResolver = (...args: any) => Array<string>
// copied heavily from https://github.com/sst/console/blob/eabe19c08188d20ab0dadf4c8059250423034ac8/packages/web/workspace/src/data/store.ts
export class Store<
	Get extends PathResolver = never,
	Scanners extends Record<string, PathResolver> = {},
	Item extends any = never
> {
	#get?: PathResolver = undefined
	#scanners: Record<string, PathResolver> = {}

	public $type<Type>() {
		return this as any as Store<Get, Scanners, Type>
	}

	public scan<Name extends string, Resolver extends PathResolver>(name: Name, resolver: Resolver) {
		this.#scanners[name] = resolver
		return this as Store<Get, Scanners & { [name in Name]: Resolver }, Item>
	}

	public get<Resolver extends PathResolver>(resolver: Resolver) {
		this.#get = resolver
		return this as any as Store<Resolver, Scanners, Item>
	}

	public build() {
		const result: Record<string, any> = {}

		for (const [name, resolver] of Object.entries(this.#scanners)) {
			result[name] = (tx: ReadTransaction, ...args: any[]) => {
				return tx
					.scan({
						prefix: '/' + resolver(...args).join('/')
					})
					.values()
					.toArray()
			}

			result[name].watch = (
				rep: () => Replicache,
				args: () => any[],
				refiner?: (items: Item[]) => any
			) => {
				return createScan(() => '/' + resolver(...args()).join('/'), rep, refiner)
			}
		}

		result.get = (tx: ReadTransaction, ...args: any[]) => {
			return tx.get('/' + this.#get!(...args).join('/'))
		}

		result.get.watch = (rep: () => Replicache, args: () => any[]) => {
			return createGet(() => '/' + this.#get!(...args()).join('/'), rep)
		}

		result.update = async (tx: WriteTransaction, id: string, updater: (input: any) => void) => {
			const [item] = await tx
				.scan({
					indexName: 'id',
					start: {
						key: [id]
					}
				})
				.entries()
				.toArray()

			const [[_, pk], rawValue] = item
			const value = structuredClone(rawValue)
			console.log('update', tx, id, updater, value)

			if (!value) throw new Error('Item not found')
			updater(value as any)
			await tx.set(pk, value)
		}

		result.remove = async (tx: WriteTransaction, id: string) => {
			const [item] = await tx
				.scan({
					indexName: 'id',
					start: {
						key: [id]
					}
				})
				.entries()
				.toArray()

			const [[_, pk], rawValue] = item
			const value = structuredClone(rawValue)
			if (!value) throw new Error('Item not found')
			await tx.del(pk)
		}

		result.put = async (tx: WriteTransaction, args: any[], item: Item) => {
			console.log('put', tx, args, item)
			await tx.set('/' + this.#get!(...args).join('/'), item as any)
		}

		return result as {
			[name in keyof Scanners]: ((
				tx: ReadTransaction,
				...args: Parameters<Scanners[name]>
			) => Promise<Item[]>) & {
				watch: {
					(
						rep: () => Replicache,
						args: () => Parameters<Scanners[name]>
					): ReturnType<typeof createScan<Item>>
					<Refiner extends (items: Item[]) => any | undefined>(
						rep: () => Replicache,
						args: () => Parameters<Scanners[name]>,
						refine?: Refiner
						// TODO think we need a writable store here
					): (() => ReturnType<Refiner>) & {
						ready: Writable<boolean>
					}
				}
			}
		} & {
			get: ((tx: ReadTransaction, ...args: Parameters<Get>) => Promise<Item>) & {
				watch: (
					rep: () => Replicache,
					args: () => Parameters<Get>
				) => ReturnType<typeof createGet<Item>>
			}
			update: (tx: WriteTransaction, id: string, updator: (item: Item) => void) => Promise<void>
			remove: (tx: WriteTransaction, id: string) => Promise<void>
			put: (tx: WriteTransaction, args: Parameters<Get>, item: Partial<Item>) => Promise<void>
		}
	}
}

function createGet<T>(p: () => string, replicache: () => Replicache) {
	let unsubscribe: () => void

	const store = writable<T | undefined>(undefined)
	const ready = writable(false)

	function s() {
		if (unsubscribe) unsubscribe()
		const rep = replicache()
		const path = p()

		unsubscribe = rep.experimentalWatch(
			diffs => {
				for (const diff of diffs) {
					if (diff.op === 'add') {
						store.set(structuredClone(diff.newValue) as T)
					}
					if (diff.op === 'change') {
						store.update(state => {
							return {
								...state,
								...(structuredClone(diff.newValue) as T)
							}
						})
					}
					if (diff.op === 'del') store.set(undefined)
				}
				ready.set(true)
			},
			{
				prefix: path,
				initialValuesInFirstDiff: true
			}
		)

		return {
			subscribe: store.subscribe,
			destroy: () => {
				unsubscribe()
			},
			ready
		}
	}

	return s
}

function createScan<T>(
	p: () => string,
	replicache: () => Replicache,
	refine?: (values: T[]) => T[]
) {
	let unsubscribe: () => void

	//    TODO: implement with signals in svelte 5

	const keyToIndex = new Map<string, number>()
	const indexToKey = new Map<number, string>()
	const ready = writable(false)

	//
	function store() {
		if (unsubscribe) unsubscribe()
		const data = writable<T[]>([])
		const rep = replicache()
		const path = p()

		unsubscribe = rep.experimentalWatch(
			diffs => {
				// fast set if we haven't seen diffs
				if (!get(ready)) {
					const values: T[] = []
					for (const diff of diffs) {
						if (diff.op === 'add') {
							const value = structuredClone(diff.newValue) as T
							const index = values.push(value)
							keyToIndex.set(diff.key, index - 1)
							indexToKey.set(index - 1, diff.key)
						}
					}
					ready.set(true)
					data.set(values)
					return
				}

				data.update(state => {
					for (const diff of diffs) {
						if (diff.op === 'add') {
							const index = state.push(structuredClone(diff.newValue) as T)
							keyToIndex.set(diff.key, index - 1)
							indexToKey.set(index - 1, diff.key)
						} else if (diff.op === 'change') {
							const index = keyToIndex.get(diff.key)
							// TODO: fine grained reconcile for faster performance
							if (index !== undefined) {
								state[index] = structuredClone(diff.newValue) as T
							}
						} else if (diff.op === 'del') {
							const toRemove = keyToIndex.get(diff.key)!
							const last = state[state.length - 1]
							const lastKey = indexToKey.get(state.length - 1)!

							state[toRemove] = last
							keyToIndex.delete(diff.key)
							indexToKey.delete(toRemove)

							keyToIndex.set(lastKey, toRemove)
							indexToKey.set(toRemove, lastKey)
							indexToKey.delete(state.length - 1)

							state.pop()
						}
					}
					return state
				})
				ready.set(true)
			},
			{
				prefix: path,
				initialValuesInFirstDiff: true
			}
		)

		if (refine) {
			data.update(refine)
		}

		return {
			subscribe: data.subscribe,
			destroy: () => {
				unsubscribe()
			},
			ready
		}
	}

	return store
}

const s = new Store()

const e = s.scan('Test', (a: string) => [])
