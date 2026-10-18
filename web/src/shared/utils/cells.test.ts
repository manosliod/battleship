import { describe, expect, it } from 'vitest'

import { move } from './cells'

describe('move', () => {
	it('steps one cell with the arrow keys and jumps to the row ends with Home and End', () => {
		expect(move({ row: 4, column: 4 }, 'ArrowUp')).toEqual({ row: 3, column: 4 })
		expect(move({ row: 4, column: 4 }, 'Home')).toEqual({ row: 4, column: 0 })
		expect(move({ row: 4, column: 4 }, 'End')).toEqual({ row: 4, column: 9 })
	})

	it('goes nowhere at the edge, so a key on the edge never counts as a second tap', () => {
		expect(move({ row: 4, column: 0 }, 'Home')).toBeNull()
		expect(move({ row: 4, column: 9 }, 'End')).toBeNull()
		expect(move({ row: 0, column: 4 }, 'ArrowUp')).toBeNull()
		expect(move({ row: 4, column: 4 }, 'Tab')).toBeNull()
	})
})
