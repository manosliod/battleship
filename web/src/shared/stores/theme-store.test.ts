import { describe, expect, it, vi } from 'vitest'

import type { ThemeChoice } from '@/forest/theme'
import type { ThemeService } from '@/shared/services/theme-service'

import { createThemeStore } from './theme-store'

const aThemeService = (stored: ThemeChoice = 'system'): ThemeService => ({
	key: 'theme',
	parse: (value) => (value === 'light' || value === 'dark' ? value : 'system'),
	read: vi.fn(() => stored),
	save: vi.fn(),
	apply: vi.fn()
})

describe('theme store', () => {
	it('starts on System by default', () => {
		expect(createThemeStore(aThemeService()).getState().theme).toBe('system')
	})

	it('starts on the stored choice', () => {
		expect(createThemeStore(aThemeService('light')).getState().theme).toBe('light')
	})

	it('saves and applies a choice at once', () => {
		const service = aThemeService()
		const store = createThemeStore(service)
		store.getState().actions.choose('dark')
		expect(store.getState().theme).toBe('dark')
		expect(service.save).toHaveBeenCalledWith('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
	})

	it('follows a choice made in another tab and ignores other keys', () => {
		const service = aThemeService()
		const store = createThemeStore(service)
		store.getState().actions.sync(new StorageEvent('storage', { key: 'other', newValue: 'dark' }))
		expect(store.getState().theme).toBe('system')
		store.getState().actions.sync(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }))
		expect(store.getState().theme).toBe('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
		store.getState().actions.sync(new StorageEvent('storage', { key: null, newValue: null }))
		expect(store.getState().theme).toBe('system')
	})
})
