import { vi } from 'vitest'

export function mockWindowClass(compact: boolean) {
	const list = { matches: !compact, addEventListener: vi.fn(), removeEventListener: vi.fn() }
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => list)
	)
}

type StorageOverrides = Partial<Pick<Storage, 'getItem' | 'setItem'>>

export const aStorage = (stored: string | null = null, overrides: StorageOverrides = {}) => ({
	getItem: vi.fn(() => stored),
	setItem: vi.fn(),
	...overrides
})
