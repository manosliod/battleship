import { FleetItem } from '@/shared/components/fleet-item'
import { shipLength, ships } from '@/shared/types/game'

import { useCurrentShip, useFleet } from '../stores/placement-store-provider'

export function PlacementFleet({ className }: { className: string }) {
	const fleet = useFleet()
	const current = useCurrentShip()
	return (
		<section aria-labelledby="placement-ships" className={`flex flex-col gap-3 ${className}`}>
			<h2 id="placement-ships" className="sr-only text-title-small text-on-surface expanded:not-sr-only">
				Ships
			</h2>
			<ul className="flex flex-wrap gap-2 expanded:flex-col">
				{ships.map((ship) => {
					const placed = fleet.some((placement) => placement.ship === ship)
					return (
						<FleetItem
							key={ship}
							ship={ship}
							state={ship === current ? 'current' : 'default'}
							segments={Array.from({ length: shipLength[ship] }, () => (placed ? 'ship' : 'water'))}
							status={ship === current ? 'placing now' : placed ? 'placed' : 'not placed'}
						/>
					)
				})}
			</ul>
		</section>
	)
}
