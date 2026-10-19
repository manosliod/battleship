import { afterEach, describe, expect, it, vi } from 'vitest'

import { isCompactWindow } from './window-class'

describe('window class', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.style.removeProperty('--breakpoint-medium')
	})

	it('asks the browser on every call for the medium breakpoint the tokens set', () => {
		document.documentElement.style.setProperty('--breakpoint-medium', '600px')
		const list = { matches: false }
		const matchMedia = vi.fn(() => list)
		vi.stubGlobal('matchMedia', matchMedia)
		expect(isCompactWindow()).toBe(true)
		list.matches = true
		expect(isCompactWindow()).toBe(false)
		expect(matchMedia).toHaveBeenCalledWith('(width >= 600px)')
	})
})
