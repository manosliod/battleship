import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { aStorage } from '@/testing/window'

import { createThemeService } from './theme-service'

const blocked = () => {
	throw new DOMException('denied', 'SecurityError')
}

const metas = () =>
	[...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((meta) => meta.media)

const colorScheme = () => document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content

describe('theme service', () => {
	beforeEach(() => {
		document.head.innerHTML = `
			<meta name="theme-color" media="(prefers-color-scheme: light)" data-scheme="light" />
			<meta name="theme-color" media="(prefers-color-scheme: dark)" data-scheme="dark" />
			<meta name="color-scheme" content="light dark" />`
	})

	afterEach(() => {
		document.head.innerHTML = ''
		delete document.documentElement.dataset['theme']
	})

	it('reads System when nothing is stored', () => {
		const service = createThemeService({ storage: () => aStorage(), root: () => document })
		expect(service.read()).toBe('system')
	})

	it('reads a stored choice and ignores anything else', () => {
		expect(createThemeService({ storage: () => aStorage('dark'), root: () => document }).read()).toBe('dark')
		expect(createThemeService({ storage: () => aStorage('sepia'), root: () => document }).read()).toBe('system')
	})

	it('falls back to System when storage cannot be read', () => {
		const service = createThemeService({ storage: blocked, root: () => document })
		expect(service.read()).toBe('system')
		const throwing = createThemeService({
			storage: () => aStorage(null, { getItem: blocked }),
			root: () => document
		})
		expect(throwing.read()).toBe('system')
	})

	it('saves the choice under "theme" and survives a storage that refuses it', () => {
		const storage = aStorage()
		createThemeService({ storage: () => storage, root: () => document }).save('light')
		expect(storage.setItem).toHaveBeenCalledWith('theme', 'light')
		const full = createThemeService({ storage: () => aStorage(null, { setItem: blocked }), root: () => document })
		expect(() => {
			full.save('dark')
		}).not.toThrow()
	})

	it('pins data-theme, color-scheme and the theme-color meta to a chosen theme', () => {
		const service = createThemeService({ storage: () => aStorage(), root: () => document })
		service.apply('dark')
		expect(document.documentElement.dataset['theme']).toBe('dark')
		expect(colorScheme()).toBe('dark')
		expect(metas()).toEqual(['not all', 'all'])
	})

	it('hands both back to the system on System, so a system change needs no script', () => {
		const service = createThemeService({ storage: () => aStorage(), root: () => document })
		service.apply('light')
		service.apply('system')
		expect(document.documentElement.dataset['theme']).toBe('system')
		expect(colorScheme()).toBe('light dark')
		expect(metas()).toEqual(['(prefers-color-scheme: light)', '(prefers-color-scheme: dark)'])
	})
})
