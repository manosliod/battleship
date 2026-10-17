import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Board } from './board'
import type { CellView } from './cell-view'

const cells = (overrides: Readonly<Record<number, CellView>> = {}): readonly CellView[] =>
	Array.from({ length: 100 }, (_, key) => overrides[key] ?? { content: 'water', enabled: true })

describe('Board', () => {
	it('labels every cell by coordinate and content', () => {
		render(<Board label="Enemy waters" size="large" cells={cells({ 0: { content: 'miss', enabled: false } })} />)

		expect(screen.getByRole('grid', { name: 'Enemy waters' })).toHaveAttribute('aria-readonly', 'true')
		expect(screen.getAllByRole('gridcell')).toHaveLength(100)
		expect(screen.getByRole('gridcell', { name: 'A1, miss' })).toBeInTheDocument()
		expect(screen.getByRole('gridcell', { name: 'J10, water' })).toBeInTheDocument()
	})

	it('activates a cell by click or Enter and moves with the arrow keys', () => {
		const onActivate = vi.fn()
		const onMove = vi.fn()
		render(<Board label="Enemy waters" size="large" cells={cells()} onActivate={onActivate} onMove={onMove} />)

		const first = screen.getByRole('gridcell', { name: 'A1, water' })
		expect(first).toHaveAttribute('tabindex', '0')
		fireEvent.click(screen.getByRole('gridcell', { name: 'F8, water' }))
		expect(onActivate).toHaveBeenCalledWith({ row: 7, column: 5 })

		fireEvent.keyDown(first, { key: 'ArrowRight' })
		expect(onMove).toHaveBeenCalledWith({ row: 0, column: 1 })
		expect(screen.getByRole('gridcell', { name: 'B1, water' })).toHaveFocus()

		fireEvent.keyDown(screen.getByRole('gridcell', { name: 'B1, water' }), { key: 'Enter' })
		expect(onActivate).toHaveBeenLastCalledWith({ row: 0, column: 1 })
	})

	it('marks cells that cannot be fired at as disabled', () => {
		render(
			<Board
				label="Enemy waters"
				size="large"
				cells={cells({ 1: { content: 'hit', enabled: false } })}
				onActivate={vi.fn()}
			/>
		)

		expect(screen.getByRole('gridcell', { name: 'B1, hit' })).toHaveAttribute('aria-disabled', 'true')
	})
})
