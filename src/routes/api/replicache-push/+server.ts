import type { PushRequestV1 } from 'replicache'
import type { RequestHandler } from './$types'
import { replicacheClient, replicacheServer } from '$lib/core/replicache/replicache.sql'
import { eq } from 'drizzle-orm'
import { server } from '$lib/replicache/server'
import { user } from '$lib/core/todo/todo.sql'
import { poke } from '$lib/util/pusher'
// import Pusher from 'pusher'
// import { PUBLIC_PUSHER_APP_ID, PUBLIC_PUSHER_CLUSTER, PUBLIC_PUSHER_KEY } from '$env/static/public'
// import { PUSHER_SECRET } from '$env/static/private'

const serverID = 1
export const POST: RequestHandler = async ({ url, platform, request, locals }) => {
	const push: PushRequestV1 = await request.json()
	console.log('processing push', JSON.stringify(push))

	const t0 = Date.now()

	// hopefully this exists, if not we're f***ed
	const { DB } = locals

	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 })
	}

	const u = await DB.select()
		.from(user)
		.where(eq(user.id, locals.user.id))
		.then(rows => rows.at(0))

	if (!u) {
		// create user
		await DB.insert(user).values({
			id: locals.user.id
		})
	}

	try {
		// Iterate each mutation in push
		for (const mutation of push.mutations) {
			const t1 = Date.now()
			try {
				await DB.transaction(async tx => {
					const { clientID } = mutation

					let prevVersion = await DB.select()
						.from(replicacheServer)
						.where(eq(replicacheServer.id, serverID))
						.then(rows => rows.at(0)?.version)

					if (!prevVersion) {
						// create server real quick
						await DB.insert(replicacheServer).values({
							id: serverID,
							version: 1
						})

						prevVersion = 1
					}
					prevVersion = prevVersion as number

					const nextVersion = prevVersion + 1

					const lastMutationId = await DB.select({
						lastMutationId: replicacheClient.lastMutationId
					})
						.from(replicacheClient)
						.where(eq(replicacheClient.id, clientID))
						.then(rows => rows.at(0)?.lastMutationId ?? 0)

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

					try {
						await server.execute(mutation.name, mutation.args, {
							DB,
							user: locals.user!,
							version: nextVersion
						})
					} catch (e) {
						throw new Error(`Error executing mutation ${mutation.name}: ${e}`)
					}

					console.log(`Setting ${clientID} to ${nextMutationId}`)

					const rows = await DB.update(replicacheClient)
						.set({
							clientGroupId: push.clientGroupID,
							lastMutationId: nextMutationId,
							version: nextVersion
						})
						.where(eq(replicacheClient.id, clientID))

					console.log({ rows })
					if (rows.rowsAffected === 0) {
						await DB.insert(replicacheClient).values({
							id: clientID,
							clientGroupId: push.clientGroupID,
							lastMutationId: nextMutationId,
							version: nextVersion
						})
					}

					// update global version

					await DB.update(replicacheServer)
						.set({
							version: nextVersion
						})
						.where(eq(replicacheServer.id, serverID))

					// if (error === undefined) {

					// }
				})

				await poke()
			} catch (e) {
				console.error('Caught error from mutation', mutation, e)
			}
		}
		// TODO Poke
	} catch (e) {
		console.error(e)
	} finally {
		console.log('push took', Date.now() - t0, 'ms')
	}

	return new Response('{}')
}

// async function poke() {
// 	const pusher = new Pusher({
// 		appId: PUBLIC_PUSHER_APP_ID,
// 		key: PUBLIC_PUSHER_KEY,
// 		secret: PUSHER_SECRET,
// 		cluster: PUBLIC_PUSHER_CLUSTER,
// 		useTLS: true
// 	})
// 	const t0 = Date.now()

// 	await pusher.trigger('default', 'poke', {})
// 	console.log('Sent poke in', Date.now() - t0, 'ms')
// }
