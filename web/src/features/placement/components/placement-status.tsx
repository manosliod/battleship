import { usePlacementStatus } from '../hooks/use-placement-status'

export function PlacementStatus({ className }: { className: string }) {
	const { headline, supporting, tone } = usePlacementStatus()
	return (
		<div role="status" className={`flex min-h-placement-status flex-col expanded:min-h-0 gap-1 ${className}`}>
			<h2 className={`text-title-medium ${tone === 'error' ? 'text-error' : 'text-on-surface'}`}>{headline}</h2>
			<p className="text-body-medium text-on-surface-variant">{supporting}</p>
		</div>
	)
}
