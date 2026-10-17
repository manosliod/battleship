import { FleetItem } from '@/shared/components/fleet-item'
import { shipLength, ships } from '@/shared/types/game'

export function FleetCard({ className }: { className: string }) {
	return (
		<section
			aria-labelledby="fleet-card"
			className={`flex flex-col gap-3 self-start rounded-large bg-surface-container-low p-4 ${className}`}
		>
			<h2 id="fleet-card" className="text-title-medium text-on-surface">
				Your fleet
			</h2>
			<p className="text-body-medium text-on-surface-variant">
				Five ships each. Ships lie across or down, inside the grid, and never overlap.
			</p>
			<ul className="flex flex-col gap-2">
				{ships.map((ship) => (
					<FleetItem
						key={ship}
						ship={ship}
						state="default"
						segments={Array.from({ length: shipLength[ship] }, () => 'ship')}
						status={`${String(shipLength[ship])} cells`}
					/>
				))}
			</ul>
		</section>
	)
}
