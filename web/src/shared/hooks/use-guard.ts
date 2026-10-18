import { useErrorBoundary } from 'react-error-boundary'

export class GameActionError extends Error {
	constructor(cause: unknown) {
		super('A game action failed', { cause })
		this.name = 'GameActionError'
	}
}

export function useGuard() {
	const { showBoundary } = useErrorBoundary()
	return <Args extends unknown[], Result>(action: (...args: Args) => Result) =>
		(...args: Args): Result | undefined => {
			try {
				return action(...args)
			} catch (error) {
				showBoundary(new GameActionError(error))
				return undefined
			}
		}
}
