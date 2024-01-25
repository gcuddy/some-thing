import {
	DateFormatter,
	fromDate,
	getLocalTimeZone,
	today,
	isSameDay,
	isSameYear,
	type DateValue
} from '@internationalized/date'
import { Calendar, CalendarPlus, Star } from 'phosphor-svelte'
import type { ComponentType } from 'svelte'

export function isWithinWeek(val: DateValue) {
	let curr = today(getLocalTimeZone())

	for (let i = 0; i < 7; i++) {
		if (isSameDay(val, curr)) return true
		curr = curr.add({ days: 1 })
	}
	return false
}

export const todayDate = {
	text: 'Today',
	icon: Star,
	props: {
		weight: 'fill',
		class: 'text-yellow-400'
	},
	type: 'today',
	shortText: 'Today'
} as const satisfies ReturnType<typeof formatDate>

export function formatDate(
	date: Date | string,
	locale = 'en-US',
	pastAsToday = true
): {
	text: string
	icon: ComponentType
	props: Record<string, unknown>
	type: 'today' | 'tomorrow' | 'future'
	shortText: string
} {
	const d = new Date(date)
	const dt = fromDate(d, getLocalTimeZone())
	const t = today(getLocalTimeZone())

	const weekdayShort_df = new DateFormatter(locale, {
		weekday: 'short'
	})

	const weekdayLong_df = new DateFormatter(locale, {
		weekday: 'long'
	})

	const upcomingShort_df = new DateFormatter(locale, {
		month: 'short',
		day: 'numeric'
	})

	const future_upcomingShort_df = new DateFormatter(locale, {
		month: 'short',
		year: 'numeric'
	})

	const df = new DateFormatter(locale, {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	})

	const future_df = new DateFormatter(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	})

	if (isSameDay(dt, t) || (pastAsToday && dt.compare(t) < 0)) {
		return {
			text: 'Today',
			icon: Star,
			props: {
				weight: 'fill',
				class: 'text-yellow-400'
			},
			type: 'today',
			shortText: 'Today'
		}
	}

	const tomorrow = t.add({ days: 1 })

	if (isSameDay(dt, tomorrow)) {
		return {
			text: 'Tomorrow',
			icon: Calendar,
			props: {
				weight: 'fill',
				class: 'text-red-400'
			},
			type: 'tomorrow',
			shortText: weekdayShort_df.format(dt.toDate())
		}
	}

	if (isSameYear(dt, t)) {
		return {
			text: isWithinWeek(dt) ? weekdayLong_df.format(dt.toDate()) : df.format(dt.toDate()),
			icon: Calendar,
			props: {
				weight: 'fill',
				class: 'text-accent'
			},
			type: 'future',
			shortText: isWithinWeek(dt)
				? weekdayShort_df.format(dt.toDate())
				: upcomingShort_df.format(dt.toDate())
		}
	}

	return {
		text: future_df.format(dt.toDate()),
		icon: Calendar,
		props: {
			weight: 'fill',
			class: 'text-accent'
		},
		type: 'future',
		shortText: future_upcomingShort_df.format(dt.toDate())
	}
}
