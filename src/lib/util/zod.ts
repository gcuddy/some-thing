import { z } from 'zod'

export function zod<Schema extends z.ZodSchema<any, any, any>, Return extends any, Context>(
	schema: Schema,
	func: (value: z.infer<Schema>, locals: App.Locals) => Return
) {
	const result = (input: z.infer<Schema>, locals: App.Locals) => {
		const parsed = schema.parse(input)
		return func(parsed, locals)
	}
	result.schema = schema
	return result
}
