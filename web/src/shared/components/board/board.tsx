import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { boardSize } from '@/shared/types/game'
import type { Cell } from '@/shared/types/game'
import { allCells, cellKey, columnLetter, move } from '@/shared/utils/cells'

import { BoardCell } from './board-cell'
import type { CellView } from './cell-view'

type BoardProps = {
	label: string
	size: 'large' | 'small' | 'adaptive'
	cells: readonly CellView[]
	focusCell?: Cell | null
	onActivate?: (cell: Cell) => void
	onPoint?: (cell: Cell | null) => void
	onMove?: (cell: Cell) => void
}

const rows = Array.from({ length: boardSize }, (_, row) => row)
const water: CellView = { content: 'water', enabled: false }

export function Board({ label, size, cells, focusCell = null, onActivate, onPoint, onMove }: BoardProps) {
	const elements = useRef<(HTMLDivElement | null)[]>([])
	const [focused, setFocused] = useState<Cell | null>(null)
	const interactive = onActivate !== undefined
	const firstEnabled = allCells.find((cell) => cells[cellKey(cell)]?.enabled) ?? allCells[0] ?? null
	const tabStop = focused ?? focusCell ?? firstEnabled

	function handleKey(event: KeyboardEvent<HTMLDivElement>, cell: Cell) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			onActivate?.(cell)
			return
		}
		const next = move(cell, event.key)
		if (next) {
			event.preventDefault()
			setFocused(next)
			elements.current[cellKey(next)]?.focus()
			onMove?.(next)
		}
	}

	return (
		<div data-size={size} className="board-frame shrink-0">
			<div
				role="grid"
				aria-label={label}
				aria-readonly={interactive ? undefined : true}
				className="board"
				onPointerLeave={() => {
					onPoint?.(null)
				}}
				onBlur={(event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) {
						setFocused(null)
						onPoint?.(null)
					}
				}}
			>
				{size === 'small' ? null : (
					<div aria-hidden="true" className="board-coordinates board-row">
						<span className="board-corner" />
						{rows.map((column) => (
							<span
								key={column}
								className="board-band-column flex items-center justify-center text-label-small text-on-surface-variant"
							>
								{columnLetter(column)}
							</span>
						))}
					</div>
				)}
				{rows.map((row) => (
					<div key={row} role="row" className="board-row">
						{size === 'small' ? null : (
							<span aria-hidden="true" className="board-band text-label-small text-on-surface-variant">
								{String(row + 1)}
							</span>
						)}
						{rows.map((column) => {
							const cell = { row, column }
							const key = cellKey(cell)
							return (
								<BoardCell
									key={column}
									ref={(element) => {
										elements.current[key] = element
									}}
									cell={cell}
									view={cells[key] ?? water}
									interactive={interactive}
									tabStop={tabStop !== null && cellKey(tabStop) === key}
									onActivate={onActivate}
									onPoint={onPoint}
									onKeyDown={handleKey}
								/>
							)
						})}
					</div>
				))}
			</div>
		</div>
	)
}
