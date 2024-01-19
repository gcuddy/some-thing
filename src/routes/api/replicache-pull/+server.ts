import { replicacheClient, replicacheServer } from '$lib/core/replicache/replicache.sql'
import { todos } from '$lib/core/todo/todo.sql'
import { json } from '@sveltejs/kit'
import { and, eq, gt } from 'drizzle-orm'
import type { PatchOperation, PullRequestV1, PullResponse } from 'replicache'

export const POST = async ({ request, locals }) => {
	const pull: PullRequestV1 = await request.json()
	console.log(`Processing pull`, JSON.stringify(pull))

	const { clientGroupID } = pull
	const fromVersion = Number(pull.cookie ?? 0)
	const t0 = Date.now()

	try {
		const j = await locals.DB.transaction(async tx => {
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
			return json(body)
		})
		return j
	} catch (e) {
		console.error(e)
		return new Response((e as any).toString(), { status: 500 })
	} finally {
		console.log(`Processed pull in ${Date.now() - t0}ms`)
	}

	return new Response('{}')
}
