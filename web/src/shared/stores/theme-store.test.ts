import { describe, expect, it, vi } from 'vitest'

import type { ThemeChoice } from '@/forest/theme'
import type { ThemeService } from '@/shared/services/theme-service'

import { createThemeStore } from './theme-store'

const aThemeService = (stored: ThemeChoice = 'system', fromEvent: ThemeChoice | null = null): ThemeService => ({
	read: vi.fn<() => ThemeChoice>(() => stored),
	save: vi.fn(),
	apply: vi.fn(),
	readEvent: vi.fn(() => fromEvent)
})

const storageEvent = () => new StorageEvent('storage')
const pageShow = (persisted: boolean) => new PageTransitionEvent('pageshow', { persisted })

describe('theme store', () => {
	it('starts on System by default', () => {
		expect(createThemeStore(aThemeService(), new EventTarget()).getState().theme).toBe('system')
	})

	it('starts on the stored choice', () => {
		expect(createThemeStore(aThemeService('light'), new EventTarget()).getState().theme).toBe('light')
	})

	it('saves and applies a choice at once', () => {
		const service = aThemeService()
		const store = createThemeStore(service, new EventTarget())
		store.getState().actions.choose('dark')
		expect(store.getState().theme).toBe('dark')
		expect(service.save).toHaveBeenCalledWith('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
	})

	it('follows another tab only while someone is subscribed', () => {
		const service = aThemeService('system', 'dark')
		const events = new EventTarget()
		const store = createThemeStore(service, events)
		events.dispatchEvent(storageEvent())
		expect(store.getState().theme).toBe('system')
		const unsubscribe = store.subscribe(() => undefined)
		events.dispatchEvent(storageEvent())
		expect(store.getState().theme).toBe('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
		unsubscribe()
		store.setState({ theme: 'light' })
		events.dispatchEvent(storageEvent())
		expect(store.getState().theme).toBe('light')
	})

	it('ignores storage events the service does not recognise', () => {
		const service = aThemeService('light', null)
		const events = new EventTarget()
		const store = createThemeStore(service, events)
		const unsubscribe = store.subscribe(() => undefined)
		events.dispatchEvent(storageEvent())
		expect(store.getState().theme).toBe('light')
		expect(service.apply).not.toHaveBeenCalled()
		unsubscribe()
	})

	it('reads the stored choice again when the page comes back from the back-forward cache', () => {
		const service = aThemeService('light')
		const events = new EventTarget()
		const store = createThemeStore(service, events)
		const unsubscribe = store.subscribe(() => undefined)
		vi.mocked(service.read).mockReturnValue('dark')
		events.dispatchEvent(pageShow(false))
		expect(store.getState().theme).toBe('light')
		events.dispatchEvent(pageShow(true))
		expect(store.getState().theme).toBe('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
		unsubscribe()
		vi.mocked(service.read).mockReturnValue('system')
		events.dispatchEvent(pageShow(true))
		expect(store.getState().theme).toBe('dark')
	})

	it('reads the stored choice again when someone subscribes after nobody was', () => {
		const service = aThemeService('light')
		const store = createThemeStore(service, new EventTarget())
		vi.mocked(service.read).mockReturnValue('dark')
		const unsubscribe = store.subscribe(() => undefined)
		expect(store.getState().theme).toBe('dark')
		expect(service.apply).toHaveBeenCalledWith('dark')
		unsubscribe()
	})
})
