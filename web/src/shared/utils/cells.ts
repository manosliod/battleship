import { boardSize, shipLength } from '@/shared/types/game'
import type { Cell, Placement } from '@/shared/types/game'

const columnLetters = 'ABCDEFGHIJ'

export const cellName = ({ row, column }: Cell) => `${columnLetters.charAt(column)}${String(row + 1)}`

export const columnLetter = (column: number) => columnLetters.charAt(column)

export const cellKey = ({ row, column }: Cell) => row * boardSize + column

export const isOnBoard = ({ row, column }: Cell) => row >= 0 && row < boardSize && column >= 0 && column < boardSize

export const sameCell = (a: Cell | null, b: Cell | null) =>
	a !== null && b !== null && a.row === b.row && a.column === b.column

export function cellsOf({ ship, row, column, across }: Placement): readonly Cell[] {
	return Array.from({ length: shipLength[ship] }, (_, offset) =>
		across ? { row, column: column + offset } : { row: row + offset, column }
	)
}

export const allCells: readonly Cell[] = Array.from({ length: boardSize * boardSize }, (_, key) => ({
	row: Math.floor(key / boardSize),
	column: key % boardSize
}))

export function move(cell: Cell, key: string): Cell | null {
	const steps: Partial<Record<string, Cell>> = {
		ArrowUp: { row: cell.row - 1, column: cell.column },
		ArrowDown: { row: cell.row + 1, column: cell.column },
		ArrowLeft: { row: cell.row, column: cell.column - 1 },
		ArrowRight: { row: cell.row, column: cell.column + 1 },
		Home: { row: cell.row, column: 0 },
		End: { row: cell.row, column: boardSize - 1 }
	}
	const next = steps[key]
	return next && isOnBoard(next) && !sameCell(next, cell) ? next : null
}
