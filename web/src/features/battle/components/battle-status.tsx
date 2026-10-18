import { useStatus } from '../stores/battle-store-provider'

export function BattleStatus({ className }: { className: string }) {
	const { headline, supporting } = useStatus()
	return (
		<div role="status" className={`flex flex-col gap-1 ${className}`}>
			<h2 className="text-headline-small text-on-surface">{headline}</h2>
			<p className="text-body-medium text-on-surface-variant">{supporting}</p>
		</div>
	)
}
