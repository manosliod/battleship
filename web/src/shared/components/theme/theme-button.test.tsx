import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import brightnessAuto from '@/forest/assets/icons/brightness_auto.svg'
import darkMode from '@/forest/assets/icons/dark_mode.svg'
import { mockWindowClass } from '@/testing/window'

const renderButton = async () => {
	const { ThemeButton } = await import('./theme-button')
	const { ThemePanelHost } = await import('./theme-panel-host')
	const { SnackbarProvider } = await import('@/forest/components/snackbar')
	render(
		<SnackbarProvider>
			<ThemeButton />
			<ThemePanelHost />
		</SnackbarProvider>
	)
	return screen.getByRole('button', { name: 'Theme' })
}

const icon = (button: HTMLElement) => button.querySelector('.icon')?.getAttribute('style') ?? ''

const open = async (button: HTMLElement) => {
	await act(async () => {
		fireEvent.click(button)
		await import('./theme-panel')
	})
	return screen.findByRole('dialog', { name: 'Theme' })
}

describe('theme button', () => {
	beforeEach(() => {
		vi.resetModules()
		localStorage.clear()
		delete document.documentElement.dataset['theme']
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.doUnmock('./theme-panel')
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
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBeInTheDocument()
	})

	it('starts from the stored choice', async () => {
		mockWindowClass(false)
		localStorage.setItem('theme', 'light')
		const dialog = await open(await renderButton())
		expect(within(dialog).getByRole('radio', { name: 'Light' })).toBeChecked()
	})

	it('keeps the sheet while open even if the window grows to medium', async () => {
		const list = mockWindowClass(true)
		const sheet = await open(await renderButton())
		list.matches = true
		fireEvent.click(within(sheet).getByRole('radio', { name: 'Dark' }))
		expect(
			within(screen.getByRole('dialog', { name: 'Theme' })).queryByRole('button', { name: 'Done' })
		).not.toBeInTheDocument()
	})

	it('opens at once, without waiting, after the first time', async () => {
		mockWindowClass(false)
		const button = await renderButton()
		const dialog = await open(button)
		fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }))
		await waitFor(() => {
			expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
		})
		act(() => {
			fireEvent.click(button)
		})
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBeInTheDocument()
	})

	it('says so in a snackbar when the panel cannot be downloaded, and opens on the next try', async () => {
		mockWindowClass(false)
		vi.doMock('./theme-panel', () => {
			throw new TypeError('Failed to fetch dynamically imported module')
		})
		const button = await renderButton()
		await act(async () => {
			fireEvent.click(button)
			await Promise.resolve()
		})
		expect(await screen.findByText('Couldn’t open Theme. Try again.')).toBeInTheDocument()
		expect(screen.queryByRole('radiogroup', { name: 'Theme' })).not.toBeInTheDocument()
		vi.doUnmock('./theme-panel')
		const dialog = await open(button)
		expect(within(dialog).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
	})
})
