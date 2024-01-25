type Options = {
	target: string
	scope?: HTMLElement
	shouldHandleFocus?: boolean
}
export const createMultiSelectHandler = (options: Options) => {
	const targets = () =>
		Array.from((options.scope ?? document).querySelectorAll<HTMLElement>(options.target))

	const selected = (_targets?: HTMLElement[]) =>
		(_targets ?? targets()).filter(x => x.dataset.selected === 'true')
	const pivot = () => targets().find(x => x.dataset.pivot === 'true')

	const setPivot = (target: HTMLElement) => {
		const p = pivot()
		if (p === target) return
		if (p) p.removeAttribute('data-pivot')
		target.setAttribute('data-pivot', 'true')
	}

	function focus(target: HTMLElement) {
		const all = targets()
		selected(all).forEach(item => item.removeAttribute('data-selected'))
		const matchIndex = all.findIndex(item => item === target || item.contains(target))
		if (matchIndex === -1) return
		const match = all[matchIndex]
		setPivot(match)
	}

	function shiftClick(target: HTMLElement) {
		const p = pivot()
		if (!p) return
		//s elect everything between f and target

		const all = targets()
		const match = all.find(x => x === target || x.contains(target))
		if (!match) return
		const f = all.findIndex(x => x === p)
		const t = all.findIndex(x => x === target)

		const [start, end] = f < t ? [f, t] : [t, f]
		const range = all.slice(start, end + 1)
		range.forEach(item => item.setAttribute('data-selected', 'true'))
		// set everything not in range to not selected
		all.filter(x => !range.includes(x)).forEach(item => item.removeAttribute('data-selected'))
		setPivot(match)
	}

	function handleClick(event: MouseEvent) {
		const all = targets()
		if (!all.some(x => x === event.target || x.contains(event.target as HTMLElement))) return
		if (event.shiftKey) {
			shiftClick(event.target as HTMLElement)
		} else {
			focus(event.target as HTMLElement)
		}
	}

	function reset() {
		const all = targets()
		all.forEach(item => {
			if (item.dataset.focus !== 'true') {
				item.removeAttribute('data-selected')
			}
		})
		all.forEach(item => {
			if (item.dataset.focus !== 'true') {
				item.removeAttribute('data-pivot')
			}
		})
	}

	return {
		setPivot,
		shiftClick,
		handleClick,
		reset
	}
}
