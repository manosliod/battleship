import type { CellView } from '@/shared/components/board/cell-view'
import { boardSize } from '@/shared/types/game'
import type { Placement, Shot } from '@/shared/types/game'
import { cellKey, cellsOf } from '@/shared/utils/cells'

import { useAim, useHomeShots, useSnapshot, useTurn } from '../stores/battle-store-provider'

const emptyBoard = (enabled: boolean): CellView[] =>
	Array.from({ length: boardSize * boardSize }, () => ({ content: 'water', enabled }))

function drawShips(cells: CellView[], placements: readonly Placement[]) {
	for (const placement of placements) {
		for (const cell of cellsOf(placement)) {
			cells[cellKey(cell)] = { content: 'ship', enabled: false }
		}
	}
}

function drawShots(cells: CellView[], shots: readonly Shot[]) {
	for (const shot of shots) {
		cells[cellKey(shot)] = { content: shot.result, enabled: false }
	}
}

export function useEnemyCells(): readonly CellView[] {
	const snapshot = useSnapshot()
	const turn = useTurn()
	const aim = useAim()
	const cells = emptyBoard(turn === 'player')
	drawShips(cells, snapshot.revealed)
	drawShots(cells, snapshot.enemy)
	if (aim) {
		cells[cellKey(aim)] = { content: 'aimed', enabled: true }
	}
	return cells
}

export function useHomeCells(): readonly CellView[] {
	const snapshot = useSnapshot()
	const home = useHomeShots()
	const cells = emptyBoard(false)
	drawShips(cells, snapshot.fleet)
	drawShots(cells, home)
	return cells
}
