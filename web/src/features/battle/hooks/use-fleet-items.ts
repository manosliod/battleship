import type { FleetItemState, Segment } from '@/shared/components/fleet-item'
import { shipLength, ships } from '@/shared/types/game'
import type { Ship } from '@/shared/types/game'
import { cellsOf, sameCell } from '@/shared/utils/cells'

import { useHomeShots, useSnapshot } from '../stores/battle-store-provider'

export type FleetItemView = Readonly<{
	ship: Ship
	state: FleetItemState
	segments: readonly Segment[]
	status: string
}>

const plural = (count: number) => `${String(count)} hit${count === 1 ? '' : 's'}`

export function useEnemyFleet(): readonly FleetItemView[] {
	const { enemySunk } = useSnapshot()
	return ships.map((ship) => {
		const sunk = enemySunk.some((placement) => placement.ship === ship)
		return {
			ship,
			state: sunk ? 'sunk' : 'default',
			segments: Array.from({ length: shipLength[ship] }, () => (sunk ? 'sunk' : 'ship')),
			status: sunk ? 'sunk' : 'afloat'
		}
	})
}

export function useYourFleet(): readonly FleetItemView[] {
	const { fleet } = useSnapshot()
	const home = useHomeShots()
	return ships.map((ship) => {
		const placement = fleet.find((candidate) => candidate.ship === ship)
		const results = placement
			? cellsOf(placement).map((cell) => home.find((shot) => sameCell(shot, cell))?.result ?? null)
			: []
		const sunk = results.includes('sunk')
		const segments: Segment[] = results.map((result) => (sunk ? 'sunk' : result === 'hit' ? 'hit' : 'ship'))
		const hits = segments.filter((segment) => segment === 'hit').length
		return {
			ship,
			state: sunk ? 'sunk' : 'default',
			segments,
			status: sunk ? 'sunk' : hits > 0 ? plural(hits) : 'afloat'
		}
	})
}
