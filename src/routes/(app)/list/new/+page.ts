import type { List } from '@/core/list'

export function load({ url }): { type: List['type'] } {
	if (url.searchParams.has('type')) {
		const type = url.searchParams.get('type')
		if (type === 'list' || type === 'project' || type === 'area') {
			return { type }
		}
	}
	return { type: 'project' }
}
