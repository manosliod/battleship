export type Loader<T> = Readonly<{ load: () => Promise<T>; retry: () => void }>

export function loadOnce<T>(loader: () => Promise<T>): Loader<T> {
	let pending: Promise<T> | null = null
	let failed = false

	return {
		load: () => {
			pending ??= loader().catch((error: unknown) => {
				failed = true
				throw error
			})
			return pending
		},
		retry: () => {
			if (failed) {
				pending = null
				failed = false
			}
		}
	}
}
