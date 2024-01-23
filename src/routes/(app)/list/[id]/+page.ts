import { browser } from '$app/environment'
import { ListStore } from '@/data/list'

export async function load({ params, parent }) {
	//
	return {
		id: params.id
	}
}
