import { createStore } from 'zustand/vanilla'

import { ships } from '@/shared/types/game'
import type { Cell, EngineSession, Placement, Ship } from '@/shared/types/game'
import { cellKey, cellsOf, isOnBoard, sameCell } from '@/shared/utils/cells'

export type Refusal = Readonly<{
	ship: Ship
	cells: readonly Cell[]
	reason: 'offBoard' | 'overlap'
	overlaps: Ship | null
}>

export type StartResult = 'started' | 'incomplete'

export type PlacementState = Readonly<{
	fleet: readonly Placement[]
	current: Ship | null
	across: boolean
	pointer: Cell | null
	refusal: Refusal | null
	actions: Readonly<{
		tapCell: (cell: Cell) => void
		point: (cell: Cell | null) => void
		rotate: () => void
		random: () => void
		reset: () => void
		start: (name: string) => StartResult
	}>
}>

const firstMissing = (fleet: readonly Placement[]) =>
	ships.find((ship) => !fleet.some((placement) => placement.ship === ship)) ?? null

export function shipAt(fleet: readonly Placement[], cell: Cell): Placement | null {
	return fleet.find((placement) => cellsOf(placement).some((part) => cellKey(part) === cellKey(cell))) ?? null
}

export function check(fleet: readonly Placement[], placement: Placement): Refusal | null {
	const others = fleet.filter((other) => other.ship !== placement.ship)
	const cells = cellsOf(placement)
	const inside = cells.filter(isOnBoard)
	const overlap = inside.map((cell) => shipAt(others, cell)).find((other) => other !== null) ?? null
	if (inside.length < cells.length) {
		return { ship: placement.ship, cells: inside, reason: 'offBoard', overlaps: null }
	}
	if (overlap) {
		return { ship: placement.ship, cells: inside, reason: 'overlap', overlaps: overlap.ship }
	}
	return null
}

export function createPlacementStore(session: EngineSession) {
	return createStore<PlacementState>()((set, get) => {
		const fleetNow = () => session.snapshot().fleet

		const settle = (current: Ship | null = firstMissing(fleetNow())) => {
			const fleet = fleetNow()
			set({ fleet, current, refusal: null })
		}

		const initial = fleetNow()

		return {
			fleet: initial,
			current: firstMissing(initial),
			across: true,
			pointer: null,
			refusal: null,
			actions: {
				tapCell: (cell) => {
					const { fleet, current, across } = get()
					const placed = shipAt(fleet, cell)
					if (placed) {
						session.remove(placed.ship)
						set({ across: placed.across, pointer: cell })
						settle(placed.ship)
						return
					}
					if (!current) {
						return
					}
					const placement = { ship: current, row: cell.row, column: cell.column, across }
					const problem = session.place(placement)
					if (problem === null) {
						settle()
						return
					}
					set({ pointer: cell, refusal: check(fleet, placement) })
				},
				point: (cell) => {
					if (cell === null) {
						set({ pointer: null })
					} else if (!sameCell(cell, get().pointer)) {
						set({ pointer: cell, refusal: null })
					}
				},
				rotate: () => {
					set((state) => ({ across: !state.across, refusal: null }))
				},
				random: () => {
					session.clear()
					session.placeRest()
					settle()
				},
				reset: () => {
					session.clear()
					set({ across: true })
					settle()
				},
				start: (name) => (session.start(name) === null ? 'started' : 'incomplete')
			}
		}
	})
}

export type PlacementStore = ReturnType<typeof createPlacementStore>
