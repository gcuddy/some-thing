export function distributeItems(min: number, max: number, n: number) {
	// Calculate the interval between items
	const interval = (max - min) / (n - 1)

	// Initialize an array to store the distributed values
	const distributedItems = []

	// Distribute items evenly within the range
	for (let i = 0; i < n; i++) {
		const value = min + i * interval
		distributedItems.push(value)
	}

	return distributedItems
}
