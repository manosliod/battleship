export type Loader<T> = Readonly<{ load: () => Promise<T>; current: () => T | undefined; retry: () => void }>

export function loadOnce<T>(loader: () => Promise<T>): Loader<T> {
	let pending: Promise<T> | null = null
	let failed = false
	let value: T | undefined

	return {
		load: () => {
			pending ??= loader().then(
				(loaded) => {
					value = loaded
					return loaded
				},
				(error: unknown) => {
					failed = true
					throw error
				}
			)
			return pending
		},
		current: () => value,
		retry: () => {
			if (failed) {
				pending = null
				failed = false
			}
		}
	}
}
