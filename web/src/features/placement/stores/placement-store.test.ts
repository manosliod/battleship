import { describe, expect, it, vi } from 'vitest'

import { aFakeSession, aFleet, aSnapshot } from '@/testing/factories'

import { check, createPlacementStore } from './placement-store'

describe('placement store', () => {
	it('starts with the carrier, across', () => {
		const store = createPlacementStore(aFakeSession())

		expect(store.getState()).toMatchObject({ current: 'CARRIER', across: true, fleet: [], refusal: null })
	})

	it('places the current ship and moves on to the next missing one', () => {
		const place = vi.fn(() => null)
		const snapshot = vi
			.fn()
			.mockReturnValueOnce(aSnapshot())
			.mockReturnValue(aSnapshot({ fleet: [{ ship: 'CARRIER', row: 1, column: 1, across: true }] }))
		const store = createPlacementStore(aFakeSession({ place, snapshot }))

		store.getState().actions.tapCell({ row: 1, column: 1 })

		expect(place).toHaveBeenCalledWith({ ship: 'CARRIER', row: 1, column: 1, across: true })
		expect(store.getState().current).toBe('BATTLESHIP')
	})

	it('names the ship a refused placement would overlap', () => {
		const fleet = [{ ship: 'CARRIER', row: 1, column: 0, across: true }] as const
		const store = createPlacementStore(
			aFakeSession({ place: () => 'OVERLAP', snapshot: () => aSnapshot({ fleet, missing: ['BATTLESHIP'] }) })
		)

		store.getState().actions.rotate()
		store.getState().actions.tapCell({ row: 0, column: 2 })

		expect(store.getState().refusal).toMatchObject({ ship: 'BATTLESHIP', reason: 'overlap', overlaps: 'CARRIER' })
		expect(check(fleet, { ship: 'BATTLESHIP', row: 3, column: 0, across: true })).toBeNull()
	})

	it('shows the cells inside the grid when a ship would run off it', () => {
		const store = createPlacementStore(aFakeSession({ place: () => 'OFF_BOARD' }))

		store.getState().actions.tapCell({ row: 0, column: 8 })

		expect(store.getState().refusal).toEqual({
			ship: 'CARRIER',
			cells: [
				{ row: 0, column: 8 },
				{ row: 0, column: 9 }
			],
			reason: 'offBoard',
			overlaps: null
		})
	})

	it('picks a placed ship up to move it', () => {
		const remove = vi.fn()
		const placed = aSnapshot({ fleet: aFleet().slice(0, 1), missing: [] })
		const store = createPlacementStore(aFakeSession({ remove, snapshot: () => placed }))

		store.getState().actions.tapCell({ row: 0, column: 2 })

		expect(remove).toHaveBeenCalledWith('CARRIER')
		expect(store.getState()).toMatchObject({ current: 'CARRIER', across: true })
	})

	it('places the whole fleet at random and is then ready', () => {
		const clear = vi.fn()
		const placeRest = vi.fn()
		const snapshot = vi
			.fn()
			.mockReturnValueOnce(aSnapshot())
			.mockReturnValue(aSnapshot({ fleet: aFleet(), missing: [] }))
		const store = createPlacementStore(aFakeSession({ clear, placeRest, snapshot }))

		store.getState().actions.random()

		expect(clear).toHaveBeenCalled()
		expect(placeRest).toHaveBeenCalled()
		expect(store.getState().current).toBeNull()
	})

	it('starts the battle only when the engine accepts it', () => {
		const refusing = createPlacementStore(aFakeSession({ start: () => 'FLEET_INCOMPLETE' }))
		const accepting = createPlacementStore(aFakeSession())

		expect(refusing.getState().actions.start('Ada')).toBe('incomplete')
		expect(accepting.getState().actions.start('Ada')).toBe('started')
	})
})
