import type { TodoFilterFn } from '@/types'
import { fromDate, getLocalTimeZone, isToday } from '@internationalized/date'

export const filterFn: TodoFilterFn = todo => {
	if (!todo.startDate) return false
	const date = fromDate(new Date(todo.startDate), getLocalTimeZone())
	return isToday(date, getLocalTimeZone())
}
