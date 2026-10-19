import { afterEach, describe, expect, it, vi } from 'vitest'

import { isCompactWindow } from './window-class'

describe('window class', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('asks the browser for the medium breakpoint on every call', () => {
		const list = { matches: false }
		const matchMedia = vi.fn(() => list)
		vi.stubGlobal('matchMedia', matchMedia)
		expect(isCompactWindow()).toBe(true)
		list.matches = true
		expect(isCompactWindow()).toBe(false)
		expect(matchMedia).toHaveBeenCalledWith('(width >= 600px)')
	})
})
