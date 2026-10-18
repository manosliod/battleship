import type { CellView } from '@/shared/components/board/cell-view'
import { cellKey, cellsOf } from '@/shared/utils/cells'

import { check, shipAt } from '../stores/placement-store'
import { useAcross, useCurrentShip, useFleet, usePointer, useRefusal } from '../stores/placement-store-provider'

export function usePlacementCells(): readonly CellView[] {
	const fleet = useFleet()
	const current = useCurrentShip()
	const across = useAcross()
	const pointer = usePointer()
	const refusal = useRefusal()

	const cells: CellView[] = Array.from({ length: 100 }, () => ({ content: 'water', enabled: true }))
	for (const placement of fleet) {
		for (const cell of cellsOf(placement)) {
			cells[cellKey(cell)] = { content: 'ship', enabled: true }
		}
	}
	const preview =
		current && pointer && !shipAt(fleet, pointer)
			? { ship: current, row: pointer.row, column: pointer.column, across }
			: null
	const problem = refusal ?? (preview ? check(fleet, preview) : null)
	const shown = problem ? problem.cells : preview ? cellsOf(preview) : []
	for (const cell of shown) {
		cells[cellKey(cell)] = { content: problem ? 'invalid' : 'preview', enabled: true }
	}
	return cells
}
