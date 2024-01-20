import { Context } from '$lib/util/context'

const UserContext = Context.create<{ id?: string }>('user')
export const withUser = UserContext.with
// export const useUser = UserContext.use;

export const useUser = () => {
	const u = UserContext.use()
	if (!u.id) throw new Error(`Expected user to have id`)
	return u.id
}
