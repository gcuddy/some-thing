import { browser } from '$app/environment'
import { Replicache } from 'replicache'

export async function load() {
	if (browser) {
		const replicache = new Replicache({
			name: 'user42',
			licenseKey: 'ld43a69e6baa14a1a85eb6bb09661739e',
			indexes: {
				id: {
					allowEmpty: true,
					jsonPointer: '/id'
				}
			}
		})
		return {
			replicache
		}
	}
}
