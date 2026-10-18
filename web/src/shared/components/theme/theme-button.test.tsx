import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import brightnessAuto from '@/forest/assets/icons/brightness_auto.svg'
import darkMode from '@/forest/assets/icons/dark_mode.svg'
import { mockWindowClass } from '@/testing/window'

const renderButton = async () => {
	const { ThemeButton } = await import('./theme-button')
	render(<ThemeButton />)
	return screen.getByRole('button', { name: 'Theme' })
}

const icon = (button: HTMLElement) => button.querySelector('.icon')?.getAttribute('style') ?? ''

const open = async (button: HTMLElement) => {
	await act(async () => {
		fireEvent.click(button)
		await import('./theme-panel')
	})
	return screen.findByRole('dialog')
}

describe('theme button', () => {
	beforeEach(() => {
		vi.resetModules()
		localStorage.clear()
		delete document.documentElement.dataset['theme']
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('opens a sheet without Done on compact', async () => {
		mockWindowClass(true)
		const button = await renderButton()
		const sheet = await open(button)
		expect(within(sheet).getByRole('heading', { name: 'Theme' })).toBeInTheDocument()
		expect(within(sheet).queryByRole('button', { name: 'Done' })).not.toBeInTheDocument()
		expect(within(sheet).getByRole('radio', { name: 'System' })).toBeChecked()
	})

	it('opens a dialog with Done from medium up', async () => {
		mockWindowClass(false)
		const dialog = await open(await renderButton())
		expect(within(dialog).getByRole('button', { name: 'Done' })).toBeInTheDocument()
		expect(within(dialog).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
	})

	it('applies and stores a choice at once and stays open', async () => {
		mockWindowClass(false)
		const button = await renderButton()
		expect(icon(button)).toContain(brightnessAuto)
		const dialog = await open(button)
		fireEvent.click(within(dialog).getByRole('radio', { name: 'Dark' }))
		expect(icon(button)).toContain(darkMode)
		expect(within(dialog).getByRole('radio', { name: 'Dark' })).toBeChecked()
		expect(document.documentElement.dataset['theme']).toBe('dark')
		expect(localStorage.getItem('theme')).toBe('dark')
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})

	it('starts from the stored choice', async () => {
		mockWindowClass(false)
		localStorage.setItem('theme', 'light')
		const dialog = await open(await renderButton())
		expect(within(dialog).getByRole('radio', { name: 'Light' })).toBeChecked()
	})
})
