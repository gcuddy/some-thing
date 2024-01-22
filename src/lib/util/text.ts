export function processTasksFromText(text: string) {
	const lines = text.split('\n')

	return lines.map(line => {
		return line.replace(/^- \[ \]\s*/, '').trim()
	})
}
