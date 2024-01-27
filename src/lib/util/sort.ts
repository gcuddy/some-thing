export function sortIndexes<T extends { index: number | null; timeCreated: Date }>(
	a: T,
	b: T
): -1 | 1 {
	const aIndex = a.index ?? 0
	const bIndex = b.index ?? 0
	if (aIndex === bIndex) return a.timeCreated > b.timeCreated ? 1 : -1
	return aIndex > bIndex ? 1 : -1
}
