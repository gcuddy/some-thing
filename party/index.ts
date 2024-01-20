import type * as Party from 'partykit/server'
import { json, ok } from './utils'
import { MutationV1, PatchOperation, PullRequestV1, PullResponse, PushRequestV1 } from 'replicache'
import { createDb } from '../src/lib/core/drizzle/index'
import { createTransaction } from '../src/lib/util/transaction'

import {
	replicacheServer,
	replicacheClient,
	replicacheClientGroup
} from '../src/lib/core/replicache/replicache.sql'
import { todos } from '../src/lib/core/todo/todo.sql'
import { and, eq, gt } from 'drizzle-orm'
import { server } from '../src/lib/replicache/server'
import { z } from 'zod'
import { handlePush } from '../src/lib/replicache/push'

const mutationSchema = z.object({
	clientID: z.string(),
	id: z.number(),
	name: z.string(),
	args: z.string(),
	timestamp: z.number()
})

const pushRequestV0Schema = z.object({
	pushVersion: z.literal(0)
})

const pushRequestV1Schema = z.object({
	pushVersion: z.literal(1),
	profileID: z.string(),
	clientGroupID: z.string(),
	mutations: z.array(mutationSchema),
	schemaVersion: z.literal('1')
})
const cookieSchema = z.union([
	z.object({
		version: z.number(),
		// partialSync: partialSyncStateSchema,
		order: z.number()
	}),
	z.null()
])

type Cookie = z.TypeOf<typeof cookieSchema>
const pullRequestV1 = z.object({
	pullVersion: z.literal(1),
	profileID: z.string(),
	clientGroupID: z.string(),
	cookie: cookieSchema,
	schemaVersion: z.string()
})


const serverID = 1

export default class Server implements Party.Server {
	db: ReturnType<typeof createDb>

	constructor(readonly room: Party.Room) {
		// TODO: make this better
		this.db = createDb({
			authToken: room.env.VITE_TURSO_DB_AUTH_TOKEN as string,
			url: room.env.VITE_TURSO_DB_URL as string
		})
	}

	async onRequest(req: Party.Request): Promise<Response> {
		// cors

		if (req.method === 'OPTIONS') {
			return ok()
		}
		if (req.method === 'POST') {
			// TODO: make this more secure
			const isPush = new URL(req.url).searchParams.get('push') !== null
			const isPull = new URL(req.url).searchParams.get('pull') !== null
			if (isPush) {
				return await this.handlePush1(req)
			}
			if (isPull) {
				return await this.handlePull(req)
			}

			// const data = await req.json()
			// console.log({ data })
			return ok()
		}

		return new Response('Not Found', { status: 404 })
	}

	onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		// A websocket just connected!
		console.log(
			`Connected:
	  id: ${conn.id}
	  room: ${this.room.id}
	  url: ${new URL(ctx.request.url).pathname}`
		)

		// // let's send a message to the connection
		// conn.send('hello from server')
	}

	onMessage(message: string, sender: Party.Connection) {
		// let's log the message
		console.log(`connection ${sender.id} sent message: ${message}`)
		// as well as broadcast it to all the other connections in the room...
		// this.room.broadcast(
		// 	`${sender.id}: ${message}`,
		// 	// ...except for the connection it came from
		// 	[sender.id]
		// )
	}
	async handlePush1(request: Party.Request) {
		const push = pushRequestV1Schema.parse(await request.json())
		const user = { id: 'anon' }
		await handlePush(this.db, user, push)
		await this.sendPoke()
		return new Response('{}', { status: 200 })
	}

	async handlePull1(request: Party.Request) {
		const pull = pullRequestV1.parse(await request.json())
	}

	async handlePush(request: Party.Request) {
		const t0 = Date.now()

		// TODO: zod schema here
		const push = await request.json<PushRequestV1>()

		//    TODO: auth //
		const userID = request.headers.get('x-user-id')

		console.log({ push, userID })

		for (const mutation of push.mutations) {
			const t1 = Date.now()
			try {
				this.processMutation(
					{
						clientGroupID: push.clientGroupID,
						user: {
							id: userID as string
						}
					},
					mutation
				)
			} catch (e) {
				console.error('Caught error from mutation', mutation, e)

				// Handle errors inside mutations by skipping and moving on. This is
				// convenient in development but you may want to reconsider as your app
				// gets close to production:
				//
				// https://doc.replicache.dev/server-push#error-handling
				//
				// Ideally we would run the mutator itself in a nested transaction, and
				// if that fails, rollback just the mutator and allow the lmid and
				// version updates to commit. However, nested transaction support in
				// Postgres is not great:
				//
				// https://postgres.ai/blog/20210831-postgresql-subtransactions-considered-harmful
				//
				// Instead we implement skipping of failed mutations by *re-runing*
				// them, but passing a flag that causes the mutator logic to be skipped.
				//
				// This ensures that the lmid and version bookkeeping works exactly the
				// same way as in the happy path. A way to look at this is that for the
				// error-case we replay the mutation but it just does something
				// different the second time.
				//
				// This is allowed in Replicache because mutators don't have to be
				// deterministic!:
				//
				// https://doc.replicache.dev/concepts/how-it-works#speculative-execution-and-confirmation
				this.processMutation(
					{
						clientGroupID: push.clientGroupID,
						user: {
							id: userID as string
						}
					},
					mutation,
					e as Error
				)
			}
		}

		await this.sendPoke()
		return new Response('{}', { status: 200 })

		// for ()
	}

	async handlePull(request: Party.Request) {
		const pull = await request.json<PullRequestV1>()
		const { clientGroupID } = pull
		const fromVersion = Number(pull.cookie ?? 0)
		const t0 = Date.now()

		console.log('handlePull', { clientGroupID, fromVersion })

		try {
			return await this.processPull(clientGroupID, fromVersion)
		} catch (e) {
			console.log('Caught error from pull', e)
			if (e instanceof Response) return e
			if (e instanceof Error) return new Response(e.toString(), { status: 500 })

			return new Response('Internal Server Error', { status: 500 })
		} finally {
			console.log('Processed pull in', Date.now() - t0)
		}
	}

	async processPull(clientGroupID: string, fromVersion: number) {
		return await this.db.transaction(async tx => {
			const currentVersion = await tx
				.select()
				.from(replicacheServer)
				.where(eq(replicacheServer.id, 1))
				.then(rows => rows.at(0)?.version ?? 0)

			if (fromVersion > currentVersion) {
				throw new Error(
					`fromVersion ${fromVersion} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`
				)
			}

			// get lmids for requesting client groups
			const lmids = await tx
				.select({
					id: replicacheClient.id,
					lastMutationId: replicacheClient.lastMutationId
				})
				.from(replicacheClient)
				.where(
					and(
						eq(replicacheClient.clientGroupId, clientGroupID),
						gt(replicacheClient.version, fromVersion)
					)
				)
				.then(rows => Object.fromEntries(rows.map(row => [row.id, row.lastMutationId])))

			// todo: beyond todos
			const changed = await tx.select().from(todos).where(gt(todos.version, fromVersion))

			const patch: PatchOperation[] = []

			for (const row of changed) {
				if (row.archivedAt) {
					if ((row.version ?? -1) > fromVersion) {
						patch.push({
							op: 'del',
							key: `/todo/${row.id}`
						})
					}
				} else {
					patch.push({
						op: 'put',
						key: `/todo/${row.id}`,
						value: row as any
					})
				}
			}

			const body: PullResponse = {
				lastMutationIDChanges: lmids ?? {},
				cookie: currentVersion,
				patch
			}
			console.log(`Sending pull response`, JSON.stringify(body))
			return Response.json(body)
		})
	}

	async sendPoke() {
		const t0 = Date.now()
		this.room.broadcast('poke', [])
		console.log('Sent poke in', Date.now() - t0)
	}

	async processMutation(
		{ clientGroupID, user }: { clientGroupID: string; user: { id: string } },
		mutation: MutationV1,
		error?: Error | string | undefined
	) {
		console.log('processMutation', mutation)
		await this.db.transaction(async tx => {
			const { clientID } = mutation

			console.log('inside transaction')

			let prevVersion = await tx
				.select()
				.from(replicacheServer)
				.where(eq(replicacheServer.id, serverID))
				.then(rows => rows.at(0)?.version)

			console.log({ prevVersion })

			if (!prevVersion) {
				// create server real quick
				await tx.insert(replicacheServer).values({
					id: serverID,
					version: 1
				})

				prevVersion = 1
			}
			prevVersion = prevVersion as number

			const nextVersion = prevVersion + 1

			console.log({ clientID })

			const lastMutationId = await tx
				.select({
					lastMutationId: replicacheClient.lastMutationId
				})
				.from(replicacheClient)
				.where(eq(replicacheClient.id, clientID))
				.then(rows => rows.at(0)?.lastMutationId ?? 0)

			console.log({ lastMutationId })

			const nextMutationId = lastMutationId + 1

			if (mutation.id < nextMutationId) {
				console.log(`Mutation ${mutation.id} has already been processed - skipping`)
				return
			}
			if (mutation.id > nextMutationId) {
				throw new Error(
					`Mutation ${mutation.id} is from the future - aborting. This can happen in development if the server restarts. In that case, clear appliation data in browser and refresh.`
				)
			}

			if (error === undefined) {
				console.log('Processing mutation:', JSON.stringify(mutation))
				try {
					await server.execute(mutation.name, mutation.args)
				} catch (e) {
					throw new Error(`Error executing mutation ${mutation.name}: ${e}`)
				}
			} else {
				// TODO: You can store state here in the database to return to clients to
				// provide additional info about errors.
				console.log('Handling error from mutation', JSON.stringify(mutation), error)
			}

			console.log(`Setting ${clientID} to ${nextMutationId}`)

			const rows = await tx
				.update(replicacheClient)
				.set({
					clientGroupId: clientGroupID,
					lastMutationId: nextMutationId,
					version: nextVersion
				})
				.where(eq(replicacheClient.id, clientID))

			console.log({ rows })
			if (rows.rowsAffected === 0) {
				await tx.insert(replicacheClient).values({
					id: clientID,
					clientGroupId: clientGroupID,
					lastMutationId: nextMutationId,
					version: nextVersion
				})
			}

			// update global version

			await tx
				.update(replicacheServer)
				.set({
					version: nextVersion
				})
				.where(eq(replicacheServer.id, serverID))

			// if (error === undefined) {

			// }
		})
	}
}

Server satisfies Party.Worker
