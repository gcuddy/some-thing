import type { Ctx } from '$lib/replicache/ctx'
import { z } from 'zod'

export function zod<Schema extends z.ZodSchema<any, any, any>, Return extends any>(
	schema: Schema,
	func: (value: z.infer<Schema>, ctx: Ctx) => Return
) {
	const result = (input: z.infer<Schema>, ctx: Ctx) => {
		const parsed = schema.parse(input)
		return func(parsed, ctx)
	}
	result.schema = schema
	return result
}
