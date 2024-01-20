import type { PushRequestV1 } from 'replicache'
import { createTransaction } from '../util/transaction'
import type { DB } from '../core/drizzle'
import { replicacheClient, replicacheClientGroup } from '$lib/core/replicache/replicache.sql'
import { and, eq } from 'drizzle-orm'
import { server } from './server'
import { VisibleError } from '$lib/util/error'
import { withUser } from '$lib/core/user'

export async function handlePush(db: DB, user: { id: string }, body: PushRequestV1) {
	await withUser(user, async () => {
		for (const mutation of body.mutations) {
			await createTransaction(db, async tx => {
				const group = await tx
					.select({
						id: replicacheClientGroup.id,
						cvrVersion: replicacheClientGroup.cvrVersion,
						clientVersion: replicacheClientGroup.clientVersion,
						userID: replicacheClientGroup.userID
					})
					.from(replicacheClientGroup)
					.where(and(eq(replicacheClientGroup.id, body.clientGroupID)))
					.execute()
					.then(
						rows =>
							rows.at(0) ?? {
								id: body.clientGroupID,
								userID: user.id,
								cvrVersion: 0,
								clientVersion: 0
							}
					)
				const client = await tx
					.select({
						id: replicacheClient.id,
						clientGroupID: replicacheClient.clientGroupId,
						mutationID: replicacheClient.mutationId,
						clientVersion: replicacheClient.clientVersion
					})
					.from(replicacheClient)
					.where(and(eq(replicacheClient.id, mutation.clientID)))
					.execute()
					.then(
						rows =>
							rows.at(0) || {
								id: body.clientGroupID,
								clientGroupID: body.clientGroupID,
								mutationID: 0,
								clientVersion: 0
							}
					)

				const nextClientVersion = group.clientVersion + 1
				const nextMutationID = client.mutationID + 1

				if (mutation.id < nextMutationID) {
					console.log(`Mutation ${mutation.id} has already been processed - skipping`)
					return
				}

				if (mutation.id > nextMutationID) {
					throw new Error(`Mutation ${mutation.id} is from the future - aborting`)
				}

				const { args, name } = mutation
				console.log('processing', mutation.id, name)

				try {
					await server.execute(name, args)
				} catch (ex) {
					if (!(ex instanceof VisibleError)) console.error(ex)
				}

				await tx
					.insert(replicacheClientGroup)
					.values({
						id: body.clientGroupID,
						clientVersion: nextClientVersion,
						cvrVersion: group.cvrVersion,
						userID: user.id
					})
					.onConflictDoUpdate({
						set: {
							cvrVersion: group.cvrVersion,
							clientVersion: nextClientVersion
						},
						target: replicacheClientGroup.id
					})
					.execute()

				await tx
					.insert(replicacheClient)
					.values({
						id: mutation.clientID,
						clientGroupId: group.id,
						mutationId: nextMutationID,
						clientVersion: nextClientVersion
					})
					.onConflictDoUpdate({
						set: {
							clientGroupId: group.id,
							mutationId: nextMutationID,
							clientVersion: nextClientVersion
						},
						target: replicacheClient.id
					})
					.execute()
			})
		}
	})

	// TODO: return a response
	// TODO: poke
}
