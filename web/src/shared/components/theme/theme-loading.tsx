import { LoadingIndicator } from '@/forest/components/loading-indicator'

export function ThemeLoading() {
	return (
		<div className="flex w-theme-picker max-w-[calc(100vw---spacing(8))] justify-center">
			<LoadingIndicator label="Loading Theme" />
		</div>
	)
}
