import type * as Party from 'partykit/server'
import { PushRequestV1 } from 'replicache'
import { createDb } from '../src/lib/core/drizzle/index'
import { json, ok } from './utils'

import { z } from 'zod'
import { handlePull } from '../src/lib/replicache/pull'
import { handlePush } from '../src/lib/replicache/push'
import { users } from '../src/lib/core/user/user.sql'
import { eq } from 'drizzle-orm'

const mutationSchema = z.object({
	clientID: z.string(),
	id: z.number(),
	name: z.string(),
	args: z.any(),
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
	schemaVersion: z.string()
})
const cookieSchema = z.union([
	z.object({
		version: z.number(),
		// partialSync: partialSyncStateSchema,
		order: z.number()
	}),
	z.number(),
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
	cachedUserIds: Set<string> = new Set()

	constructor(readonly room: Party.Room) {
		// TODO: make this better
		this.db = createDb({
			authToken: room.env.VITE_TURSO_DB_AUTH_TOKEN as string,
			url: room.env.VITE_TURSO_DB_URL as string
		})
	}

	async onRequest(req: Party.Request): Promise<Response> {
		// cors

		const userId = req.headers.get('x-user-id')
		if (!userId) {
			return new Response('Unauthorized', { status: 401 })
		}
		console.log({ userId })
		if (!this.cachedUserIds.has(userId)) {
			// check if userId exists, if not create it and cache it
			const user = await this.db
				.select()
				.from(users)
				.where(eq(users.id, userId))
				.then(rows => rows.at(0))
			// TODO: maybe cache whole user

			if (!user) {
				await this.db.insert(users).values({ id: userId })
			}

			this.cachedUserIds.add(userId)
		}

		if (req.method === 'OPTIONS') {
			return ok()
		}
		if (req.method === 'POST') {
			// TODO: make this more secure
			const isPush = new URL(req.url).searchParams.get('push') !== null
			const isPull = new URL(req.url).searchParams.get('pull') !== null
			if (isPush) {
				return await this.handlePush1(req, { id: userId })
			}
			if (isPull) {
				return await this.handlePull1(req, { id: userId })
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
	async handlePush1(request: Party.Request, user: { id: string }) {
		console.log('handlePush1')
		const push = pushRequestV1Schema.parse(await request.json())
		console.log('push', push)
		await handlePush(this.db, user, push as PushRequestV1)
		await this.sendPoke()
		return new Response('{}', { status: 200 })
	}

	async handlePull1(request: Party.Request, user: { id: string }) {
		const pull = pullRequestV1.parse(await request.json())
		// const user = { id: 'anon' }

		const resp = await handlePull(this.db, user, pull)

		return json(resp)
	}

	async sendPoke() {
		const t0 = Date.now()
		this.room.broadcast('poke', [])
		console.log('Sent poke in', Date.now() - t0)
	}
}

Server satisfies Party.Worker
