import { shipName } from '@/shared/types/game'
import type { Ship } from '@/shared/types/game'

export type Segment = 'water' | 'ship' | 'hit' | 'sunk'

export type FleetItemState = 'default' | 'current' | 'sunk'

type FleetItemProps = { ship: Ship; state: FleetItemState; segments: readonly Segment[]; status: string }

const states = {
	default: 'text-on-surface',
	current: 'bg-secondary-container text-on-secondary-container',
	sunk: 'text-on-surface-variant line-through'
} as const satisfies Record<FleetItemState, string>

export function FleetItem({ ship, state, segments, status }: FleetItemProps) {
	return (
		<li
			aria-current={state === 'current' ? 'step' : undefined}
			className={`flex w-fit items-center gap-2 rounded-full py-1 pr-3 pl-2 ${states[state]}`}
		>
			<span aria-hidden="true" className="flex gap-0.5">
				{segments.map((segment, index) => (
					<span key={index} data-content={segment} className="fleet-segment" />
				))}
			</span>
			<span className="text-label-medium">
				{shipName[ship]}
				<span className="sr-only">, {status}</span>
			</span>
		</li>
	)
}
