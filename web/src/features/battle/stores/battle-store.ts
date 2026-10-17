import { createStore } from 'zustand/vanilla'

import { hideSnackbar, showSnackbar } from '@/forest/components/snackbar'
import { shipName } from '@/shared/types/game'
import type { Cell, EngineSession, Shot, Snapshot } from '@/shared/types/game'
import { cellName, sameCell } from '@/shared/utils/cells'

export type Turn = 'player' | 'computer' | 'over'

export type Status = Readonly<{ headline: string; supporting: string }>

export type BattleState = Readonly<{
	snapshot: Snapshot
	home: readonly Shot[]
	turn: Turn
	aim: Cell | null
	status: Status
	dialog: 'over' | 'leave' | null
	actions: Readonly<{
		aim: (cell: Cell) => void
		fire: () => void
		openLeave: () => void
		closeDialog: () => void
		dispose: () => void
	}>
}>

type BattleDependencies = Readonly<{ session: EngineSession; replyDelay: number }>

type ExchangeShot = NonNullable<Snapshot['last']>['yours']

const left = (count: number, whose: string) => `${String(count)} ${whose} ship${count === 1 ? '' : 's'} left.`

function yourShotText(shot: ExchangeShot) {
	const at = cellName(shot)
	if (shot.result === 'sunk' && shot.ship) {
		return `Your shot at ${at} sank their ${shipName[shot.ship]}.`
	}
	return shot.result === 'hit' ? `Your shot at ${at} hit a ship.` : `Your shot at ${at} missed.`
}

function replyText(shot: ExchangeShot) {
	const at = cellName(shot)
	if (shot.result === 'sunk' && shot.ship) {
		return `The computer sank your ${shipName[shot.ship]} at ${at}.`
	}
	return shot.result === 'hit' ? `The computer hit your ship at ${at}.` : `The computer missed at ${at}.`
}

export function overStatus(snapshot: Snapshot): Status {
	return snapshot.winner === 'player'
		? { headline: 'You win', supporting: 'All five enemy ships are sunk.' }
		: { headline: 'Computer wins', supporting: 'Your whole fleet is sunk.' }
}

export const firstStatus: Status = { headline: 'Your turn', supporting: 'Pick a cell on the enemy board, then fire.' }

const isFired = (snapshot: Snapshot, cell: Cell) => snapshot.enemy.some((shot) => sameCell(shot, cell))

export function createBattleStore({ session, replyDelay }: BattleDependencies) {
	let timer: ReturnType<typeof setTimeout> | null = null

	return createStore<BattleState>()((set, get) => {
		const initial = session.snapshot()

		const reveal = (snapshot: Snapshot, reply: ExchangeShot) => {
			timer = null
			if (reply.result === 'sunk' && reply.ship) {
				showSnackbar(
					`The computer sank your ${shipName[reply.ship]}. ${left(snapshot.afloat.player.length, 'of your')}`
				)
			}
			if (snapshot.phase === 'over') {
				set({ home: snapshot.home, turn: 'over', status: overStatus(snapshot), dialog: 'over' })
				return
			}
			set({
				home: snapshot.home,
				turn: 'player',
				status: {
					headline: 'Your turn',
					supporting:
						reply.result === 'miss' ? `${replyText(reply)} Pick a cell, then fire.` : replyText(reply)
				}
			})
		}

		return {
			snapshot: initial,
			home: initial.home,
			turn: initial.phase === 'over' ? 'over' : 'player',
			aim: null,
			status: initial.phase === 'over' ? overStatus(initial) : firstStatus,
			dialog: null,
			actions: {
				aim: (cell) => {
					const { turn, snapshot, aim } = get()
					if (turn !== 'player' || isFired(snapshot, cell)) {
						return
					}
					if (sameCell(aim, cell)) {
						get().actions.fire()
						return
					}
					set({ aim: cell })
				},
				fire: () => {
					const { turn, aim } = get()
					if (turn !== 'player' || !aim || session.fire(aim) !== null) {
						return
					}
					const snapshot = session.snapshot()
					const last = snapshot.last
					if (!last) {
						return
					}
					hideSnackbar()
					if (last.yours.result === 'sunk' && last.yours.ship) {
						showSnackbar(
							`You sank their ${shipName[last.yours.ship]}. ${left(snapshot.afloat.computer.length, 'enemy')}`
						)
					}
					const reply = last.reply
					if (!reply) {
						set({
							snapshot,
							home: snapshot.home,
							aim: null,
							turn: 'over',
							status: overStatus(snapshot),
							dialog: 'over'
						})
						return
					}
					set({
						snapshot,
						aim: null,
						turn: 'computer',
						status: {
							headline: 'Computer’s turn',
							supporting:
								last.yours.result === 'sunk'
									? yourShotText(last.yours)
									: `${yourShotText(last.yours)} The computer is firing…`
						}
					})
					timer = setTimeout(() => {
						reveal(snapshot, reply)
					}, replyDelay)
				},
				openLeave: () => {
					set({ dialog: 'leave' })
				},
				closeDialog: () => {
					set({ dialog: null })
				},
				dispose: () => {
					if (timer) {
						clearTimeout(timer)
						timer = null
					}
					hideSnackbar()
				}
			}
		}
	})
}

export type BattleStore = ReturnType<typeof createBattleStore>
