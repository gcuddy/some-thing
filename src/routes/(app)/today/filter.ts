import type { TodoFilterFn } from '@/types'
import { fromDate, getLocalTimeZone, isToday, today } from '@internationalized/date'

export const filterFn: TodoFilterFn = todo => {
	if (!todo.startDate) return false
	const date = fromDate(new Date(todo.startDate), getLocalTimeZone())
	//  We also want "today" items to be those that are in the past
	return isToday(date, getLocalTimeZone()) || date.compare(today(getLocalTimeZone())) < 0
}
