import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SnackbarProvider } from '@/forest/components/snackbar'
import { mockWindowClass } from '@/testing/window'

import { ThemeButton } from './theme-button'
import { ThemePanelHost } from './theme-panel-host'

vi.mock('./theme-panel', () => {
	throw new TypeError('Failed to fetch dynamically imported module')
})

describe('theme panel host', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('says so in a snackbar when the panel cannot be downloaded, and opens on the next try', async () => {
		mockWindowClass(false)
		render(
			<SnackbarProvider>
				<ThemeButton />
				<ThemePanelHost />
			</SnackbarProvider>
		)
		const button = screen.getByRole('button', { name: 'Theme' })
		await act(async () => {
			fireEvent.click(button)
			await Promise.resolve()
		})
		expect(await screen.findByText('Couldn’t open Theme. Try again.')).toBeInTheDocument()
		expect(screen.queryByRole('radiogroup', { name: 'Theme' })).not.toBeInTheDocument()
		vi.doUnmock('./theme-panel')
		await act(async () => {
			fireEvent.click(button)
			await import('./theme-panel')
		})
		const dialog = await screen.findByRole('dialog', { name: 'Theme' })
		expect(within(dialog).getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
	})
})
