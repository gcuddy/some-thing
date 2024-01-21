import { getContext, onDestroy, setContext } from 'svelte'
import type { Action } from 'svelte/action'
import { writable } from 'svelte/store'

type Options = {
	target: string
	onSelect: (input: HTMLElement) => void
	onKeydown?: (
		e: KeyboardEvent,
		el: HTMLElement
	) => Promise<boolean | undefined> | boolean | undefined
	scope?: HTMLElement
	initialFocus?: HTMLElement
}
//  Action<HTMLElement, Options>
export const createKeyboardNavigator = (options: Options) => {
	const targets = () =>
		Array.from((options.scope ?? document).querySelectorAll<HTMLElement>(options.target))

	const focused = () => targets().find(x => x.dataset.focus === 'true')

	const store = writable<{
		index: number[]
		selected: number[]
		adjacentPivot: number | null
	}>({
		index: [],
		selected: [],
		adjacentPivot: null
	})

	// todo: mutation observer to edit store?

	function move(offset: -1 | 1) {
		const all = targets()
		if (all.length === 0) return
		const focusedIndex = all.findIndex(x => x.dataset.focus === 'true')
		const f = all[focusedIndex]

		if (!f) {
			if (offset === 1) all.at(0)?.setAttribute('data-focus', 'true')
			if (offset === -1) all.at(-1)?.setAttribute('data-focus', 'true')
			return
		}

		const next = all[focusedIndex + offset]
		if (!next) return

		f.removeAttribute('data-focus')
		next.setAttribute('data-focus', 'true')

		if (focusedIndex + offset == 0) {
			next.scrollIntoView({
				block: 'end'
			})
			return
		}

		next.scrollIntoView({
			block: 'nearest'
		})
	}

	const handleKeydown = async (e: KeyboardEvent) => {
		if (document.activeElement?.tagName === 'TEXAREA') return
		if (
			document.activeElement?.tagName === 'INPUT' &&
			(document.activeElement as HTMLInputElement).type === 'text'
		)
			return
		const shiftTab = e.shiftKey && e.key === 'Tab'
		console.log({ shiftTab })
		if (options.onKeydown) {
			const f = focused()
			if (f) {
				if (await options.onKeydown(e, f)) {
					e.preventDefault()
					return
				}
			}
		}
		if (e.key === 'j') move(1)
		if (e.key === 'k') move(-1)
		console.log({ e })
		if (e.key === 'ArrowUp' || shiftTab) {
			console.log('up')
			e.preventDefault()
			move(-1)
			return
		}
		if (e.key === 'ArrowDown' || e.key === 'Tab') {
			e.preventDefault()
			move(1)
			return
		}

		if (e.key === 'Enter') {
			const f = focused()
			if (f) options.onSelect(f)
			return
		}
	}

	const handleKeyup = (e: KeyboardEvent) => {
		//
	}

	function focus(target: HTMLElement) {
		const all = targets()
		const matchIndex = all.findIndex(item => item === target || item.contains(target))
		if (matchIndex === -1) return
		const match = all[matchIndex]
		const f = focused()
		store.update(s => {
			return {
				...s,
				selected: [matchIndex],
				adjacentPivot: matchIndex
			}
		})
		if (f === match) return
		if (f) f.removeAttribute('data-focus')
		match.setAttribute('data-focus', 'true')
	}

	console.log({ options })
	if (options.initialFocus) {
		focus(options.initialFocus)
	}

	document.addEventListener('keydown', handleKeydown)
	document.addEventListener('keyup', handleKeyup)

	onDestroy(() => {
		document.removeEventListener('keydown', handleKeydown)
		document.removeEventListener('keyup', handleKeyup)
	})

	return {
		move,
		focus,
		toggleFocus(target: HTMLElement) {
			const all = targets()
			if (all.length === 0) return
			const matchIndex = all.findIndex(item => item === target || item.contains(target))
			if (matchIndex === -1) return
			const match = all[matchIndex]
			const f = focused()
			if (f === match) {
				// If target is already focused, unfocus it
				match.removeAttribute('data-focus')
				return
			}
		},
		get focused() {
			return focused()
		},
		...store
	}
}

const s = Symbol('keyboard-navigator')

export const setKeyboardNavigatorContext = (
	context: ReturnType<typeof createKeyboardNavigator>
) => {
	setContext(s, context)
}

export const getKeyboardNavigatorContext = () => {
	const context = getContext(s)
	if (!context) throw new Error('KeyboardNavigator context not found')
	return context as ReturnType<typeof createKeyboardNavigator>
}
