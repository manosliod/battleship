import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockWindowClass } from '@/testing/window'

const download = { arrive: (): void => undefined, failed: false }

const renderButton = async () => {
	const { SnackbarProvider } = await import('@/forest/components/snackbar')
	const { ThemeButton } = await import('./theme-button')
	const { ThemePanelHost } = await import('./theme-panel-host')
	render(
		<SnackbarProvider>
			<ThemeButton />
			<ThemePanelHost />
		</SnackbarProvider>
	)
	return screen.getByRole('button', { name: 'Theme' })
}

const press = async (button: HTMLElement) => {
	await act(async () => {
		fireEvent.click(button)
		await Promise.resolve()
	})
}

const wait = async (ms: number) => {
	await act(async () => {
		await new Promise((resolve) => {
			setTimeout(resolve, ms)
		})
	})
}

const arrive = async () => {
	download.arrive()
	await wait(50)
}

describe('theme panel while it downloads', () => {
	beforeEach(() => {
		vi.resetModules()
		download.failed = false
		vi.doMock('./theme-panel', async (importOriginal) => {
			await new Promise<void>((resolve) => {
				download.arrive = resolve
			})
			if (download.failed) {
				throw new TypeError('Failed to fetch dynamically imported module')
			}
			return importOriginal()
		})
		document.documentElement.style.setProperty('--motion-duration-medium1', '250ms')
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.doUnmock('./theme-panel')
		document.documentElement.style.removeProperty('--motion-duration-medium1')
	})

	it('opens the dialog in its loading state after 250 ms, then shows the picker in the same dialog', async () => {
		mockWindowClass(false)
		const button = await renderButton()
		await press(button)
		await wait(200)
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		await wait(100)
		const dialog = screen.getByRole('dialog', { name: 'Theme' })
		expect(within(dialog).getByRole('progressbar', { name: 'Loading Theme' })).toBeInTheDocument()
		expect(within(dialog).getByRole('button', { name: 'Done' })).toBeInTheDocument()
		await arrive()
		expect(await within(dialog).findByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
		expect(within(dialog).queryByRole('progressbar')).not.toBeInTheDocument()
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBe(dialog)
	})

	it('opens the sheet in its loading state on compact, with no Done', async () => {
		mockWindowClass(true)
		await press(await renderButton())
		await wait(300)
		const sheet = screen.getByRole('dialog', { name: 'Theme' })
		expect(within(sheet).getByRole('progressbar', { name: 'Loading Theme' })).toBeInTheDocument()
		expect(within(sheet).queryByRole('button', { name: 'Done' })).not.toBeInTheDocument()
		await arrive()
		expect(await within(sheet).findByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument()
	})

	it('closes with Done while loading and stays closed when the download arrives', async () => {
		mockWindowClass(false)
		await press(await renderButton())
		await wait(300)
		const dialog = screen.getByRole('dialog', { name: 'Theme' })
		fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }))
		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})
		await arrive()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
	})

	it('closes the loading dialog and says so when the download fails', async () => {
		mockWindowClass(false)
		download.failed = true
		await press(await renderButton())
		await wait(300)
		expect(screen.getByRole('dialog', { name: 'Theme' })).toBeInTheDocument()
		await arrive()
		expect(await screen.findByText('Couldn’t open Theme. Try again.')).toBeInTheDocument()
		expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
	})
})
