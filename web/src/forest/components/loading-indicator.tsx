export function LoadingIndicator({ label = 'Loading' }: { label?: string }) {
	return (
		<span role="progressbar" aria-label={label} className="flex size-loading items-center justify-center">
			<span className="loading-shape bg-primary" />
		</span>
	)
}
