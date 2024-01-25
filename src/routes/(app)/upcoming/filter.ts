import type { TodoFilterFn } from '@/types'
import { fromDate, getLocalTimeZone, today } from '@internationalized/date'

export const filterFn: TodoFilterFn = todo => {
	if (!todo.startDate) return false
	const date = fromDate(new Date(todo.startDate), getLocalTimeZone())
	return date.compare(today(getLocalTimeZone())) > 0
}
