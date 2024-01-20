import type { DB } from '$lib/core/drizzle'
import type { ResultSet } from '@libsql/client'
import type { ExtractTablesWithRelations } from 'drizzle-orm'
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core'
import { Context } from './context'

export type Transaction = SQLiteTransaction<
	'async',
	ResultSet,
	Record<string, never>,
	ExtractTablesWithRelations<Record<string, never>>
>

type TxOrDb = Transaction | DB

const TransactionContext = Context.create<{
	tx: TxOrDb
	effects: (() => void | Promise<void>)[]
}>('TransactionContext')

export async function useTransaction<T>(callback: (trx: TxOrDb) => Promise<T>) {
	try {
		const { tx } = TransactionContext.use()
		return callback(tx)
	} catch {
		return null
	}
}
export async function createTransactionEffect(effect: () => any | Promise<any>) {
	try {
		const { effects } = TransactionContext.use()
		effects.push(effect)
	} catch {
		await effect()
	}
}

export async function createTransaction<T>(db: DB, callback: (tx: TxOrDb) => Promise<T>) {
	try {
		const { tx } = TransactionContext.use()
		return callback(tx)
	} catch {
		const effects: (() => void | Promise<void>)[] = []
		const result = await db.transaction(async tx => {
			const result = await TransactionContext.with({ tx, effects }, async () => {
				return callback(tx)
			})
			return result
		})
		await Promise.all(effects.map(x => x()))
		return result
	}
}
