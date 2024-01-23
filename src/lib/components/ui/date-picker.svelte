<script lang="ts">
	import * as Popover from '$lib/components/ui/popover'
	import { Calendar } from '$lib/components/ui/calendar'
	import * as Command from '$lib/components/ui/command'
	import { Command as CommandPrimitive } from 'cmdk-sv'

	import {
		type DateValue,
		DateFormatter,
		getLocalTimeZone,
		CalendarDate,
		today
	} from '@internationalized/date'
	import { Button } from './button'
	import { cn } from '@/util/style'
	import { Star, Calendar as CalendarIcon } from 'phosphor-svelte'
	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	})
	let value: DateValue | undefined = undefined

	let open = false
	let commandShowing = false
	let searchValue = ''

	let calendarWrapper: HTMLDivElement
	let todayButton: HTMLButtonElement
	let tomorrowButton: HTMLButtonElement

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
		if (selectedDay) return selectedDay
		const today = calendar.querySelector<HTMLElement>('[data-today]')
		if (today) return today
		const firstDay = calendar.querySelector<HTMLElement>('[data-calendar-date]')
		if (firstDay) return firstDay
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
		const today = calendarWrapper.querySelector('[data-today][data-focused]')
		if (!today) return
		if (event.detail.originalEvent.key === 'ArrowUp') {
            event.detail.originalEvent.preventDefault()
            event.detail.originalEvent.stopPropagation()
			tomorrowButton.focus()
		}
	}
</script>


<!-- TODO: someday -->

<svelte:window
	on:keydown={e => {
		if (open && !commandShowing) {
			// if arrow key, ignore,
			//
			if (e.key === 'ArrowDown') {
				// focus on next element
				const els = focusable.map(f => f())
				const index = els.findIndex(el => el === document.activeElement)
				console.log({ index })
				const contains = calendarWrapper.contains(document.activeElement)
				console.log({ contains })
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

<Popover.Root bind:open openFocus={null}>
	<Popover.Trigger>
		<!-- hm.... don't love this -->
		{value ? df.format(value.toDate(getLocalTimeZone())) : 'Select a date   '}
		<slot />
	</Popover.Trigger>
	<!-- {value ? df.format(value.toDate(getLocalTimeZone())) : "Select a date"} -->

	<Popover.Content class="flex w-64 flex-col gap-2 p-2">
		{#if commandShowing}
			<Command.Root>
				<CommandPrimitive.Input
					placeholder="When"
					class={cn(
						'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
					)}
					{...$$restProps}
					autofocus
					bind:value={searchValue}
				/>
			</Command.Root>
		{:else}
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<div
				class="flex items-center justify-center"
				tabindex={0}
				on:blur={e => {
					e.currentTarget.tabIndex = -1
				}}
			>
				<div class="relative w-fit">
					<div class="animate-blink absolute left-0 h-full w-[2px] rounded bg-gray-400"></div>
					<span class="text-xs font-medium text-muted-foreground">When</span>
				</div>
			</div>
			<button
				data-button-today
				bind:this={todayButton}
				class="inline-flex items-center focus:bg-accent"
			>
				<Star weight="fill" class="mr-1.5 h-4 w-4 text-yellow-400" />
				Today</button
			>
			<button
				data-button-tomorrow
				bind:this={tomorrowButton}
				class="inline-flex items-center focus:bg-accent"
			>
				<CalendarIcon weight="fill" class="mr-1.5 h-4 w-4 text-red-400" />
				Tomorrow</button
			>
			<div bind:this={calendarWrapper} class="rounded-md border">
				<Calendar
					on:keydown={event => {
						//@ts-expect-error - types are wrong
						handleCalendarEvent(event)
					}}
					minValue={today(getLocalTimeZone())}
					bind:value
				/>
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
