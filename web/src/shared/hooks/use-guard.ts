import { useErrorBoundary } from 'react-error-boundary'

export function useGuard() {
	const { showBoundary } = useErrorBoundary()
	return <Args extends unknown[], Result>(action: (...args: Args) => Result) =>
		(...args: Args): Result | undefined => {
			try {
				return action(...args)
			} catch (error) {
				showBoundary(error)
				return undefined
			}
		}
}
