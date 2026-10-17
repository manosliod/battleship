import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { showSnackbar } from '@/forest/components/snackbar'
import type { Snapshot } from '@/shared/types/game'
import { aFakeSession, aFleet, aSnapshot } from '@/testing/factories'

import { createBattleStore } from './battle-store'

vi.mock('@/forest/components/snackbar', () => ({ showSnackbar: vi.fn(), hideSnackbar: vi.fn() }))

const inBattle = (overrides: Partial<Snapshot> = {}) =>
	aSnapshot({ phase: 'battle', player: 'Ada', fleet: aFleet(), missing: [], ...overrides })

function storeWith(snapshots: readonly Snapshot[], fire = vi.fn(() => null)) {
	const snapshot = vi.fn()
	for (const next of snapshots) {
		snapshot.mockReturnValueOnce(next)
	}
	return { fire, store: createBattleStore({ session: aFakeSession({ fire, snapshot }), replyDelay: 500 }) }
}

describe('battle store', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('aims with one tap and fires with a second tap on the same cell', () => {
		const { fire, store } = storeWith([
			inBattle(),
			inBattle({
				enemy: [{ row: 7, column: 5, result: 'miss' }],
				home: [{ row: 0, column: 0, result: 'hit' }],
				last: {
					yours: { row: 7, column: 5, result: 'miss', ship: null },
					reply: { row: 0, column: 0, result: 'hit', ship: null }
				}
			})
		])

		store.getState().actions.aim({ row: 7, column: 5 })
		expect(store.getState().aim).toEqual({ row: 7, column: 5 })
		expect(fire).not.toHaveBeenCalled()

		store.getState().actions.aim({ row: 7, column: 5 })
		expect(fire).toHaveBeenCalledWith({ row: 7, column: 5 })
		expect(store.getState()).toMatchObject({
			turn: 'computer',
			aim: null,
			home: [],
			status: { headline: 'Computer’s turn', supporting: 'Your shot at F8 missed. The computer is firing…' }
		})
	})

	it('shows the computer’s reply after the delay', () => {
		const { store } = storeWith([
			inBattle(),
			inBattle({
				enemy: [{ row: 0, column: 0, result: 'miss' }],
				home: [{ row: 6, column: 6, result: 'miss' }],
				last: {
					yours: { row: 0, column: 0, result: 'miss', ship: null },
					reply: { row: 6, column: 6, result: 'miss', ship: null }
				}
			})
		])

		store.getState().actions.aim({ row: 0, column: 0 })
		store.getState().actions.fire()
		vi.advanceTimersByTime(500)

		expect(store.getState()).toMatchObject({
			turn: 'player',
			home: [{ row: 6, column: 6, result: 'miss' }],
			status: { headline: 'Your turn', supporting: 'The computer missed at G7. Pick a cell, then fire.' }
		})
	})

	it('ignores cells already fired at and shots out of turn', () => {
		const { fire, store } = storeWith([inBattle({ enemy: [{ row: 1, column: 1, result: 'hit' }] })])

		store.getState().actions.aim({ row: 1, column: 1 })
		store.getState().actions.fire()

		expect(store.getState().aim).toBeNull()
		expect(fire).not.toHaveBeenCalled()
	})

	it('ends the game with your winning shot and opens the dialog', () => {
		const { store } = storeWith([
			inBattle(),
			inBattle({
				phase: 'over',
				winner: 'player',
				enemy: [{ row: 2, column: 2, result: 'sunk' }],
				last: { yours: { row: 2, column: 2, result: 'sunk', ship: 'DESTROYER' }, reply: null }
			})
		])

		store.getState().actions.aim({ row: 2, column: 2 })
		store.getState().actions.fire()

		expect(store.getState()).toMatchObject({
			turn: 'over',
			dialog: 'over',
			status: { headline: 'You win', supporting: 'All five enemy ships are sunk.' }
		})
		expect(showSnackbar).not.toHaveBeenCalled()
	})

	it('ends the game when the computer’s reply sinks your last ship', () => {
		const { store } = storeWith([
			inBattle(),
			inBattle({
				phase: 'over',
				winner: 'computer',
				last: {
					yours: { row: 2, column: 2, result: 'miss', ship: null },
					reply: { row: 8, column: 1, result: 'sunk', ship: 'DESTROYER' }
				}
			})
		])

		store.getState().actions.aim({ row: 2, column: 2 })
		store.getState().actions.fire()
		expect(store.getState().turn).toBe('computer')
		vi.advanceTimersByTime(500)

		expect(store.getState()).toMatchObject({ turn: 'over', dialog: 'over', status: { headline: 'Computer wins' } })
	})

	it('stops the pending reply when the battle is left', () => {
		const { store } = storeWith([
			inBattle(),
			inBattle({
				last: {
					yours: { row: 0, column: 0, result: 'miss', ship: null },
					reply: { row: 0, column: 0, result: 'miss', ship: null }
				}
			})
		])

		store.getState().actions.aim({ row: 0, column: 0 })
		store.getState().actions.fire()
		store.getState().actions.dispose()
		vi.advanceTimersByTime(500)

		expect(store.getState().turn).toBe('computer')
	})
})
