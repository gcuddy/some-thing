import type { PatchOperation, PullRequestV1, PushRequestV1 } from 'replicache'
import { createTransaction } from '../util/transaction'
import type { DB } from '../core/drizzle'
import {
	replicacheClient,
	replicacheClientGroup,
	replicacheCvr
} from '$lib/core/replicache/replicache.sql'
import { and, eq, isNull, SQL, sql, type SQLWrapper } from 'drizzle-orm'
import { server } from './server'
import { VisibleError } from '$lib/util/error'
import { withUser } from '$lib/core/user'
import { todos } from '$lib/core/todo/todo.sql'
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core'

export const TABLES = {
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
			todos: isNull(todos.timeDeleted)
		} satisfies {
			[key in TableName]?: SQLWrapper
		}

		let combined: any = undefined
		let now = Date.now()

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
						eq('workspaceID' in table ? table.workspaceID : table.id, workspaceID),
						...(name in tableFilters ? [tableFilters[name as keyof typeof tableFilters]] : [])
					)
				)
			if (!combined) combined = query
			else combined = combined.unionAll(query)
			// const rows = await query.execute();
			// results.push([name, rows]);
		}
	})
}
