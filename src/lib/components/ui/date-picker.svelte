<script lang="ts">
	import { Calendar } from '$lib/components/ui/calendar'
	import * as Command from '$lib/components/ui/command'
	import * as Popover from '$lib/components/ui/popover'

	import { cn } from '@/util/style'
	import {
		DateFormatter,
		getDayOfWeek,
		getLocalTimeZone,
		parseZonedDateTime,
		today,
		type DateValue
	} from '@internationalized/date'
	import { Calendar as CalendarIcon, CalendarPlus, Star } from 'phosphor-svelte'
	import { SvelteComponent, tick, type ComponentProps, type ComponentType } from 'svelte'
	import { Button } from './button'
	export let locale = 'en-US'
	const df = new DateFormatter(locale, {
		dateStyle: 'short'
	})
	export let value: DateValue | undefined = undefined
	export let onChange: (value: Date | undefined | null) => void = () => {}
	export let open = false

	let className = ''
	export { className as class }

	const format = getLocalTimeZone()

	let commandShowing = false
	let searchValue = ''

	let calendarWrapper: HTMLDivElement
	let todayButton: HTMLButtonElement
	let tomorrowButton: HTMLButtonElement
	let dummyInput: HTMLDivElement

	$: if (searchValue.length === 0) {
		commandShowing = false
	}
	function focusWithoutScroll(element: HTMLElement) {
		const scrollPosition = {
			x: window.pageXOffset || document.documentElement.scrollLeft,
			y: window.pageYOffset || document.documentElement.scrollTop
		}
		element.focus()
		window.scrollTo(scrollPosition.x, scrollPosition.y)
	}

	function handleCalendarInitialFocus(calendar: HTMLElement) {
		const selectedDay = calendar.querySelector<HTMLElement>('[data-selected]')
		// check if selectedDay isless than toeday. If it is, skip (and return today)
		if (selectedDay) {
			const date = selectedDay.dataset.value as string
			const selectedDate = parseZonedDateTime(date)
			const todayDate = today(getLocalTimeZone())
			if (!(selectedDate.compare(todayDate) < 0)) {
				return selectedDay
			}
		}
		const t = calendar.querySelector<HTMLElement>('[data-today]')
		if (t) return t
		const firstDay = calendar.querySelector<HTMLElement>('[data-calendar-date]')
		if (firstDay) return firstDay
	}

	function handleInitialFocus() {
		const selectedDay = calendarWrapper.querySelector<HTMLElement>('[data-selected]')
		if (selectedDay) return selectedDay
		return dummyInput
	}

	const focusable: Array<() => HTMLElement | undefined> = [
		() => todayButton,
		() => tomorrowButton,
		() => handleCalendarInitialFocus(calendarWrapper)
	]

	function handleCalendarEvent(event: {
		detail: {
			currentTarget: HTMLElement
			originalEvent: KeyboardEvent
		}
	}) {
		// TODO: instead of just checking today, this should get anything in the week of today that is focused
		// That would mean it's the top row, so we should move focus up
		const today = calendarWrapper.querySelector('[data-today][data-focused]')
		if (!today) return
		if (event.detail.originalEvent.key === 'ArrowUp') {
			event.detail.originalEvent.preventDefault()
			event.detail.originalEvent.stopPropagation()
			tomorrowButton.focus()
		}
	}

	type SearchResult<T extends SvelteComponent = SvelteComponent> = {
		text: string
		icon: ComponentType<T>
		iconProps?: ComponentProps<T>
		iconClass?: string
		date: DateValue
		relativeDate: string
	}

	const defaultResultIconProps: Pick<SearchResult, 'icon' | 'iconClass' | 'iconProps'> = {
		icon: CalendarIcon,
		iconClass: 'text-red-400',
		iconProps: {
			weight: 'fill'
		}
	}

	function pushResult<T extends SvelteComponent>(result: SearchResult<T>) {
		return result
	}

	/**
	 * Convoluted way to get the locally formatted days of week in order
	 */
	function createDaysOfWeek() {
		let curr = today(getLocalTimeZone())
		const s = new DateFormatter(locale, {
			weekday: 'long'
		}).format(new Date())
		let index = getDayOfWeek(today(getLocalTimeZone()), locale)
		const weekDays: Array<string> = []

		weekDays[index] = s
		index--
		while (index >= 0) {
			curr = curr.subtract({ days: 1 })
			const weekDay = new DateFormatter(locale, {
				weekday: 'long'
			}).format(curr.toDate(getLocalTimeZone()))
			weekDays[index] = weekDay
			index--
		}

		index = 1
		while (index < 7) {
			curr = curr.add({ days: 1 })
			const weekDay = new DateFormatter(locale, {
				weekday: 'long'
			}).format(curr.toDate(getLocalTimeZone()))
			weekDays[index] = weekDay
			index++
		}

		return weekDays
	}
	const weekDays = createDaysOfWeek()

	const justWeekDayFormatter = new DateFormatter(locale, {
		weekday: 'short'
	})

	const weekDayFormatter = new DateFormatter(locale, {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	})

	const genericDateFormatter = new DateFormatter(locale, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})

	const genericDateFormatterFutureYear = new DateFormatter(locale, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})

	function genericFormatDate(date: DateValue) {
		const t = today(getLocalTimeZone())
		const year = date.year
		const todayYear = t.year
		if (year === todayYear) {
			return genericDateFormatter.format(date.toDate(getLocalTimeZone()))
		} else {
			return genericDateFormatterFutureYear.format(date.toDate(getLocalTimeZone()))
		}
	}

	const relativeDateRegex =
		/[0-9]{0,3}\s*((days|day|da|d$)|(months|month|mont|mon|mo|m$)|(weeks|week|wee|we|w))/i

	const months = [
		'january',
		'february',
		'march',
		'april',
		'may',
		'june',
		'july',
		'august',
		'september',
		'october',
		'novemeber',
		'december'
	]

	const yearRegex = /[0-9]{4}/

	function handleSearch(value: string) {
		const results: Array<SearchResult> = []
		const v = value.toLowerCase().trim()

		const timestampsAdded = new Set<string>()

		const push = <T extends SvelteComponent>(result: SearchResult<T>) => {
			const timestamp = result.date.toString()
			if (timestampsAdded.has(timestamp)) return
			timestampsAdded.add(timestamp)
			results.push(result)
		}

		if ('today'.startsWith(v)) {
			let date = today(getLocalTimeZone())
			push({
				text: 'Today',
				icon: Star,
				date,
				iconClass: 'text-yellow-400',
				iconProps: {
					weight: 'fill'
				},
				relativeDate: df.format(date.toDate(getLocalTimeZone()))
			})
		}

		if ('tomorrow'.startsWith(v)) {
			const date = today(getLocalTimeZone()).add({ days: 1 })
			push({
				text: 'Tomorrow',
				icon: CalendarIcon,
				date,
				iconClass: 'text-red-400',
				iconProps: {
					weight: 'fill'
				},
				relativeDate: df.format(date.toDate(getLocalTimeZone()))
			})
		}

		const daysOfWeek: number[] = []
		for (const day of weekDays) {
			if (day.toLowerCase().startsWith(v)) {
				daysOfWeek.push(weekDays.indexOf(day))
			}
		}
		for (const dayOfWeek of daysOfWeek) {
			// get next 3 dates that match that day of week
			let date = today(getLocalTimeZone())

			const dates: Array<DateValue> = []
			let loop = 0
			while (dates.length < (daysOfWeek.length > 1 ? 1 : 3)) {
				loop++
				const dayIndex = getDayOfWeek(date, locale)
				if (dayIndex === dayOfWeek) {
					dates.push(date)
				}
				date = date.add({ days: 1 })
				if (loop > 24) {
					break
				}
			}

			const r: Array<SearchResult> = dates.map(date => {
				return {
					text: weekDayFormatter.format(date.toDate(getLocalTimeZone())),
					icon: CalendarIcon,
					date,
					iconClass: 'text-red-400',
					iconProps: {
						weight: 'fill'
					},
					relativeDate: df.format(date.toDate(getLocalTimeZone()))
				}
			})
			for (const result of r) {
				push(result)
			}
		}

		const monthMatches: Array<number> = []

		let qualityMonthMatch = false

		const textMatch = v.match(/[a-z]+/)?.[0]

		for (let i = 1; i <= months.length; ++i) {
			if (months[i - 1].startsWith(textMatch ?? v)) {
				if (textMatch ?? ''.length >= 3) {
					qualityMonthMatch = true
				}
				monthMatches.push(i)
			}
		}

		//  handle numbers
		const numMatch = value.match(/\d+/)?.[0]
		const num = numMatch ? parseInt(numMatch) : NaN

		const yearMatch = v.match(yearRegex)?.[0]

		for (const month of monthMatches) {
			let date = today(getLocalTimeZone())
			const dates: Array<DateValue> = []
			let loop = 0

			// either add first of month, or add num match (assuming under 31 days)

			if (month < date.month) {
				// console.log('adding year, month < date.month', month, date.month)
				date = date.add({ years: 1 })
			} else if (month === date.month && num < date.day) {
				date = date.add({ years: 1 })
			}
			if (!Number.isNaN(num) && num <= 31) {
				// console.log({ num, month })
				date = date.set({ month, day: num })
				dates.push(date)
			} else {
				date = date.set({ month, day: 1 })
				dates.push(date)
			}

			if (monthMatches.length === 1) {
				// if only one month match, add next year as well
				date = date.add({ years: 1 })
				dates.push(date)
			}

			const r: Array<SearchResult> = dates.map(date => {
				return {
					text: genericDateFormatter.format(date.toDate(getLocalTimeZone())),
					icon: CalendarIcon,
					date,
					iconClass: 'text-red-400',
					iconProps: {
						weight: 'fill'
					},
					relativeDate: df.format(date.toDate(getLocalTimeZone()))
				}
			})
			for (const result of r) {
				push(result)
			}
		}

		if (relativeDateRegex.test(v) && !qualityMonthMatch) {
			const numMatch = v.match(/\d+/)?.[0]
			const num = numMatch ? parseInt(numMatch) : NaN
			const unitMatch = v.match(
				/(days|day|da|d$)|(months|month|mont|mon|mo|m$)|(weeks|week|wee|we|w)/i
			)?.[0]
			const unit = unitMatch ? unitMatch.toLowerCase() : undefined
			if (!Number.isNaN(num) && unit) {
				let date = today(getLocalTimeZone())
				if (unit.startsWith('d')) {
					date = date.add({ days: num })
				} else if (unit.startsWith('m')) {
					date = date.add({ months: num })
				} else if (unit.startsWith('w')) {
					date = date.add({ weeks: num })
				}
				push({
					...defaultResultIconProps,
					date,
					text: `In ${num} ${
						unit.startsWith('d') ? 'days' : unit.startsWith('m') ? 'months' : 'weeks'
					}`,
					relativeDate: genericFormatDate(date)
				})
			}
		}

		//
		if (!Number.isNaN(num)) {
			if (num <= 31) {
				// look for next day with that day
				let date = today(getLocalTimeZone())

				let loop = 0
				let foundDate = false
				while (!foundDate) {
					loop++
					if (date.day === num) {
						push({
							...defaultResultIconProps,
							date,
							text: genericDateFormatter.format(date.toDate(getLocalTimeZone())),
							relativeDate: justWeekDayFormatter.format(date.toDate(getLocalTimeZone()))
						})
						foundDate = true
					} else {
						date = date.add({ days: 1 })
					}
					if (loop > 32) {
						break
					}
				}
			}

			// push in "x" days, and months and years if length is short

			if (num <= 99) {
				{
					const date = today(getLocalTimeZone()).add({ days: num })
					push({
						...defaultResultIconProps,
						date,
						text: `In ${num} days`,
						relativeDate: weekDayFormatter.format(date.toDate(getLocalTimeZone()))
					})
				}
			}
		}

		// TODO: handle f could be friday or feb, etc

		// TODO: handle special "someday" case

		return results
	}
</script>

<!-- TODO: someday -->

<svelte:window
	on:keydown={e => {
		if (open && e.key === 'Escape') {
			open = false
			return
		}
		if (open && !commandShowing) {
			// console.log('OPEN', e)
			// if arrow key, ignore,
			//
			if (e.key === 'ArrowDown') {
				// focus on next element
				const els = focusable.map(f => f())
				const index = els.findIndex(el => el === document.activeElement)
				// console.log({ index })
				const contains = calendarWrapper.contains(document.activeElement)
				// console.log({ contains })
				if (contains) return
				if (index === -1) {
					els[0]?.focus()
				} else if (!calendarWrapper.contains(document.activeElement)) {
					els[index + 1]?.focus()
				}
			} else if (e.key === 'ArrowUp') {
				if (document.activeElement === tomorrowButton) {
					todayButton.focus()
				}
			}
			if (
				e.key === 'ArrowUp' ||
				e.key === 'ArrowDown' ||
				e.key === 'ArrowLeft' ||
				e.key === 'ArrowRight'
			) {
				// TODO navigate
				e.preventDefault()
			} else if (
				// check if we're typing alphanumeric characters
				e.key.length === 1 &&
				e.key.match(/[a-z0-9]/i)
			) {
				searchValue += e.key
				commandShowing = true
			}
		}
	}}
/>

<Popover.Root
	bind:open
	openFocus={handleInitialFocus}
	onOpenChange={open => {
		if (!open) {
			searchValue = ''
		}
	}}
>
	<Popover.Trigger>
		<!-- hm.... don't love this -->
		<!-- {value ? df.format(value.toDate(getLocalTimeZone())) : 'Select a date   '} -->
		<slot {value}>
			<CalendarPlus class={cn('h-5 w-5 text-muted-foreground', className)} />
		</slot>
	</Popover.Trigger>
	<!-- {value ? df.format(value.toDate(getLocalTimeZone())) : "Select a date"} -->

	<Popover.Content data-date-picker class="z-50 flex w-64 flex-col gap-2 rounded-lg p-2">
		{#if commandShowing}
			<Command.Root shouldFilter={false}>
				<Command.Input
					placeholder="When"
					class={cn(
						'flex h-7 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
					)}
					wrapperClass="border-0"
					autofocus
					bind:value={searchValue}
				/>
				<Command.List>
					<Command.Group class="p-0 pt-1.5">
						{#each handleSearch(searchValue) as result}
							<Command.Item
								value={result.date.toString()}
								onSelect={() => {
									value = result.date
									open = false
									onChange(result.date.toDate(getLocalTimeZone()))
									tick().then(() => {
										searchValue = ''
									})
								}}
								class="font-medium py-1"
							>
								<svelte:component
									this={result.icon}
									{...result.iconProps ?? {}}
									class="mr-1.5 h-4 w-4 {result.iconClass ?? ''}"
								/>
								<span class="text-white">{result.text}</span>
								<span class="ml-auto text-sm text-white/75">
									{result.relativeDate}
								</span>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		{:else}
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<div
				class="flex items-center justify-center focus-visible:outline-none"
				tabindex={0}
				on:blur={e => {
					e.currentTarget.tabIndex = -1
				}}
				bind:this={dummyInput}
			>
				<div class="relative w-fit">
					<div class="absolute left-0 h-full w-[2px] animate-blink rounded bg-gray-400"></div>
					<span class="text-xs font-medium text-muted-foreground">When</span>
				</div>
			</div>
			<div class="flex flex-col">
				<button
					data-button-today
					bind:this={todayButton}
					on:click={() => {
						value = today(getLocalTimeZone())
						open = false
						onChange(value?.toDate(getLocalTimeZone()))
					}}
					class="inline-flex items-center rounded p-1 text-sm font-medium hover:bg-accent/75 focus:bg-accent/75 focus-visible:outline-none"
				>
					<Star weight="fill" class="mr-1.5 h-4 w-4 text-yellow-400" />
					Today</button
				>
				<button
					on:click={() => {
						value = today(getLocalTimeZone()).add({ days: 1 })
						open = false
						onChange(value?.toDate(getLocalTimeZone()))
					}}
					data-button-tomorrow
					bind:this={tomorrowButton}
					class="group inline-flex items-center rounded p-1 text-sm font-medium hover:bg-accent/75 focus:bg-accent/75 focus-visible:outline-none"
				>
					<CalendarIcon weight="fill" class="mr-1.5 h-4 w-4 text-red-400 group-focus:text-white" />
					Tomorrow</button
				>
			</div>
			<div bind:this={calendarWrapper} class="rounded-md">
				<Calendar
                    class="p-1 pt-0"
					on:keydown={event => {
						//@ts-expect-error - types are wrong
						handleCalendarEvent(event)
					}}
					onValueChange={value => {
						console.log(`onValueChange`, { value })
						onChange(value?.toDate(getLocalTimeZone()))
						if (value) {
							open = false
						}
					}}
					minValue={today(getLocalTimeZone())}
					bind:value
				/>
			</div>
			<Button
                class="dark:bg-gray-800"
                variant="secondary"
				on:click={() => {
					value = undefined
					open = false
					onChange(null)
				}}>Clear</Button
			>
		{/if}
	</Popover.Content>
</Popover.Root>
