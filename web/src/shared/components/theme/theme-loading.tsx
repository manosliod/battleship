import { LoadingIndicator } from '@/forest/components/loading-indicator'

export function ThemeLoading() {
	return (
		<div className="delayed-reveal pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
			<LoadingIndicator />
		</div>
	)
}
