import {
	replicacheClient,
	replicacheClientGroup,
	replicacheCvr
} from '$lib/core/replicache/replicache.sql'
import { todos } from '$lib/core/todo/todo.sql'
import { lists } from '@/core/list/list.sql'
import { SQL, and, eq, gt, inArray, isNull, lt, sql, type SQLWrapper } from 'drizzle-orm'
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core'
import { groupBy, mapValues, pipe, toPairs } from 'remeda'
import type { PatchOperation, PullRequestV1 } from 'replicache'
import type { DB } from '../core/drizzle'
import { createTransaction } from '../util/transaction'

export const TABLES = {
	lists,
	todos
}

type TableName = keyof typeof TABLES

const TABLE_KEY = {
	// issue: [issue.stageID, issue.id],
	// resource: [resource.stageID, resource.id],
	// issueCount: [issueCount.group, issueCount.id],
	// warning: [warning.stageID, warning.type, warning.id],
	// usage: [usage.stageID, usage.id],
	// stripe: [],
} as {
	[key in TableName]?: SQLiteColumn[]
}

export async function handlePull(db: DB, user: { id: string }, req: PullRequestV1) {
	await db
		.insert(replicacheClientGroup)
		.values({
			id: req.clientGroupID,
			cvrVersion: 0,
			userID: user.id,
			clientVersion: 0
		})
		.onConflictDoNothing()

	const resp = await createTransaction(db, async tx => {
		const patch: PatchOperation[] = []

		const group = await tx
			.select({
				id: replicacheClientGroup.id,
				cvrVersion: replicacheClientGroup.cvrVersion,
				clientVersion: replicacheClientGroup.clientVersion,
				userID: replicacheClientGroup.userID
			})
			.from(replicacheClientGroup)
			.where(
				and(
					eq(replicacheClientGroup.id, req.clientGroupID),
					eq(replicacheClientGroup.userID, user.id)
				)
			)
			.execute()
			.then(rows => rows.at(0)!)

		console.log({ group })

		const oldCvr = await tx
			.select({
				data: replicacheCvr.data,
				clientVersion: replicacheCvr.clientVersion
			})
			.from(replicacheCvr)
			.where(
				and(
					eq(replicacheCvr.clientGroupID, req.clientGroupID),
					eq(replicacheCvr.id, req.cookie as number)
				)
			)
			.execute()
			.then(rows => rows.at(0))
		const cvr = oldCvr ?? {
			data: {},
			clientVersion: 0
		}

		const toPut: Record<string, { id: string; key: string }[]> = {}
		const nextCvr = {
			data: {} as Record<string, number>,
			version: Math.max(req.cookie as number, group.cvrVersion ?? 0) + 1
		}

		if (!oldCvr) {
			patch.push({
				op: 'clear'
			})
			patch.push({
				op: 'put',
				key: '/init',
				value: true
			})
		}

		const results: [string, { id: string; version: string; key: string }[]][] = []

		const tableFilters = {
			lists: isNull(lists.timeDeleted),
			todos: isNull(todos.timeDeleted)
		} satisfies {
			[key in TableName]?: SQLWrapper
		}

		let combined: any = undefined
		let now = Date.now()

		console.log('tables', Object.keys(TABLES))

		for (const [name, table] of Object.entries(TABLES)) {
			const key = TABLE_KEY[name as TableName] ?? [table.id]
			const query = tx
				.select({
					name: sql`${name}`,
					id: table.id,
					version: table.timeUpdated,
					key: sql.join([
						sql`concat_ws(`,
						sql.join([sql`'/'`, sql`''`, sql`${name}`, ...key], sql`, `),
						sql.raw(`)`)
					]) as SQL<string>
				})
				.from(table)
				.where(
					and(
						// eq('workspaceID' in table ? table.workspaceID : table.id, workspaceID),
						eq(table.userId, user.id),
						...(name in tableFilters ? [tableFilters[name as keyof typeof tableFilters]] : [])
					)
				)
			if (!combined) combined = query
			else combined = combined.unionAll(query)
			// const rows = await query.execute();
			// results.push([name, rows]);
		}

		console.log('seperate', Date.now() - now)
		now = Date.now()
		const rows = await combined.execute()

		results.push(
			...pipe(
				rows,
				groupBy((row: any) => row.name),
				toPairs
			)
		)
		console.log('combined', Date.now() - now)

		console.log('Results: ', JSON.stringify(results))
		// SST does account and here too idk

		for (const [name, rows] of results) {
			const arr = []
			for (const row of rows) {
				const version = new Date(row.version).getTime()
				if (cvr.data[row.key] !== version) {
					arr.push(row)
				}
				delete cvr.data[row.key]
				nextCvr.data[row.key] = version
			}
			toPut[name] = arr
		}

		console.log(
			'toPut',
			mapValues(toPut, value => value.length)
		)

		console.log('toDel', cvr.data)

		// new data
		for (const [name, items] of Object.entries(toPut)) {
			const ids = items.map(item => item.id)
			const keys = Object.fromEntries(items.map(item => [item.id, item.key]))

			if (!ids.length) continue
			const table = TABLES[name as keyof typeof TABLES]
			const rows = await tx
				.select()
				.from(table)
				.where(
					and(
						eq(table.userId, user.id),
						// 'workspaceID' in table && actor.type === 'user'
						// 	? eq(table.workspaceID, useWorkspace())
						// 	: undefined,
						inArray(table.id, ids)
					)
				)
				.execute()
			console.log({ rows })
			for (const row of rows) {
				const key = keys[row.id]!
				patch.push({
					op: 'put',
					key,
					value: row as any // this yells at us because of dates
				})
			}
		}

		// remove deleted data
		for (const [key] of Object.entries(cvr.data)) {
			patch.push({
				op: 'del',
				key
			})
		}

		const clients = await tx
			.select({
				id: replicacheClient.id,
				mutationID: replicacheClient.mutationId,
				clientVersion: replicacheClient.clientVersion
			})
			.from(replicacheClient)
			.where(
				and(
					eq(replicacheClient.clientGroupId, req.clientGroupID),
					gt(replicacheClient.clientVersion, cvr.clientVersion)
				)
			)
			.execute()

		const lastMutationIDChanges = Object.fromEntries(
			clients.map(c => [c.id, c.mutationID] as const)
		)

		console.log('lastMutationIDChanges', lastMutationIDChanges)

		if (patch.length > 0 || Object.keys(lastMutationIDChanges).length > 0) {
			console.log('inserting', req.clientGroupID)
			await tx
				.update(replicacheClientGroup)
				.set({
					cvrVersion: nextCvr.version
				})
				.where(eq(replicacheClientGroup.id, req.clientGroupID))
				.execute()

			await tx
				.insert(replicacheCvr)
				.values({
					id: nextCvr.version,
					data: nextCvr.data,
					clientGroupID: req.clientGroupID,
					clientVersion: group.clientVersion
				})
				.onConflictDoUpdate({
					set: {
						data: nextCvr.data
					},
					target: [replicacheCvr.id, replicacheCvr.clientGroupID]
				})
				.execute()

			await tx
				.delete(replicacheCvr)
				.where(
					and(
						eq(replicacheCvr.clientGroupID, req.clientGroupID),
						lt(replicacheCvr.id, nextCvr.version - 10)
					)
				)

			return {
				patch,
				cookie: nextCvr.version,
				lastMutationIDChanges
			}
		}

		return {
			patch: [],
			cookie: req.cookie,
			lastMutationIDChanges
		}
	})

	return resp
}
