import { getContext, onDestroy, setContext } from 'svelte'
import type { Action } from 'svelte/action'
import { writable } from 'svelte/store'

type Options = {
	target: string
	onSelect: (input: HTMLElement) => void
	onDelete: (els: HTMLElement[]) => void
	onKeydown?: (
		e: KeyboardEvent,
		{
			focused,
			selected
		}: {
			focused: HTMLElement
			selected: HTMLElement[]
		}
	) => Promise<boolean | undefined> | boolean | undefined
	scope?: HTMLElement
	initialFocus?: HTMLElement
	disable?: () => boolean
}
//  Action<HTMLElement, Options>
export const createKeyboardNavigator = (options: Options) => {
	const targets = () =>
		Array.from((options.scope ?? document).querySelectorAll<HTMLElement>(options.target))

	const focused = () => targets().find(x => x.dataset.focus === 'true')
	const selected = () => targets().filter(x => x.dataset.selected === 'true')

	const store = writable<{
		index: number[]
		selected: number[]
		adjacentPivot: number | null
	}>({
		index: [],
		selected: [],
		adjacentPivot: null
	})

	// pivot is equivalent to data-focus
	// selected is equivalent to data-selected
	let pivot = 0

	// todo: mutation observer to edit store?

	function move(offset: -1 | 1) {
		const all = targets()
		if (all.length === 0) return
		all.forEach(item => item.removeAttribute('data-selected'))
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
		if (options.disable?.()) {
			return
		}
		if (document.activeElement?.tagName === 'TEXTAREA') return
		const escapee = document.querySelector('[data-escapee]')
		if (document.activeElement === escapee || escapee?.contains(document.activeElement)) return
		if (
			document.activeElement?.tagName === 'INPUT' &&
			(document.activeElement as HTMLInputElement).type === 'text'
		)
			return
		const shiftTab = e.shiftKey && e.key === 'Tab'
		if (options.onKeydown) {
			const f = focused()
			if (f) {
				if (
					await options.onKeydown(e, {
						focused: f,
						selected: selected()
					})
				) {
					e.preventDefault()
					return
				}
			}
		}
		if (e.key === 'j') move(1)
		if (e.key === 'k') move(-1)
		if (e.key === 'ArrowUp' || shiftTab) {
			e.preventDefault()
			move(-1)
			return
		}
		if (e.key === 'ArrowDown' && e.shiftKey) {
			// add next item to selection, and focus it
			e.preventDefault()
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
		// delete
		if (e.key === 'Backspace') {
			const f = focused()
			const s = selected()
			if (f) {
				options.onDelete(s.length > 0 ? s : [f])
			}
			return
		}
	}

	const handleKeyup = (e: KeyboardEvent) => {
		//
	}

	function focus(target: HTMLElement) {
		const all = targets()
		all.forEach(item => item.removeAttribute('data-selected'))
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

	function selectAdjacent(target: HTMLElement) {
		const all = targets()
		const matchIndex = all.findIndex(item => item === target || item.contains(target))
		if (matchIndex === -1) return
		const match = all[matchIndex]
		const f = focused()
		if (!f) {
			// do focus
			return
		}
		const pivotIndex = all.findIndex(item => item === f || item.contains(f))
		if (pivotIndex === -1) return

		//  now get items between pivot and match
		const items = all.slice(Math.min(pivotIndex, matchIndex), Math.max(pivotIndex, matchIndex))

		//  now set all items to selected
		items.forEach(item => item.setAttribute('data-selected', 'true'))

		f.removeAttribute('data-focus')
		match.setAttribute('data-focus', 'true')
		match.setAttribute('data-selected', 'true')
	}

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
		get selected() {
			return selected()
		},
		selectAdjacent,
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
