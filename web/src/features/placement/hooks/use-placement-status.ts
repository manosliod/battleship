import { shipLength, shipName } from '@/shared/types/game'

import { useAcross, useCurrentShip, useFleet, useRefusal } from '../stores/placement-store-provider'

export type PlacementStatus = Readonly<{ headline: string; supporting: string; tone: 'normal' | 'error' }>

export function usePlacementStatus(): PlacementStatus {
	const fleet = useFleet()
	const current = useCurrentShip()
	const across = useAcross()
	const refusal = useRefusal()

	if (refusal) {
		const reason = refusal.overlaps
			? `It would overlap your ${shipName[refusal.overlaps]}.`
			: 'It would run off the grid.'
		return {
			headline: `The ${shipName[refusal.ship]} doesn’t fit there`,
			supporting: `${reason} Pick another cell or rotate it.`,
			tone: 'error'
		}
	}
	if (!current) {
		return {
			headline: 'Your fleet is ready',
			supporting: 'Tap a ship to move it, or start the battle.',
			tone: 'normal'
		}
	}
	const hint = fleet.length === 0 ? 'Rotate turns it.' : 'tap a placed ship to move it.'
	return {
		headline: `Place your ${shipName[current]}`,
		supporting: `${String(shipLength[current])} cells, ${across ? 'across' : 'down'}. Tap a cell to place it; ${hint}`,
		tone: 'normal'
	}
}
