import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

import { cell, placeAtRandomAndStart, startGame } from './play'

const lightSurface = 'rgb(244, 251, 248)'
const darkSurface = 'rgb(14, 21, 19)'

const html = (page: Page) => page.locator('html')
const surface = (page: Page) => page.locator('body')
const themeButton = (page: Page) => page.getByRole('button', { name: 'Theme' })
const picker = (page: Page) => page.getByRole('radiogroup', { name: 'Theme' })

async function openTheme(page: Page) {
	await themeButton(page).click()
	await expect(picker(page)).toBeVisible()
}

test('the Theme button opens a sheet on compact and a dialog with Done from medium up', async ({ page }, info) => {
	await page.goto('./')
	await openTheme(page)
	const done = page.getByRole('button', { name: 'Done' })
	if (info.project.name === 'compact') {
		await expect(done).toHaveCount(0)
	} else {
		await expect(done).toBeVisible()
	}
	await expect(page.getByRole('radio', { name: 'System' })).toBeChecked()
	await expect(page.getByRole('radio', { name: 'System' })).toBeFocused()
})

test('a choice applies at once, keeps the panel open and closes with Escape', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	await openTheme(page)
	await page.getByRole('radio', { name: 'Dark' }).click()
	await expect(html(page)).toHaveAttribute('data-theme', 'dark')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await expect(picker(page)).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
})

test('the checked Dark segment keeps the rounded end of the group', async ({ page }) => {
	await page.goto('./')
	await openTheme(page)
	const system = page.getByRole('radio', { name: 'System' })
	const light = page.getByRole('radio', { name: 'Light' })
	const dark = page.getByRole('radio', { name: 'Dark' })
	await dark.click()
	await expect(dark).toBeChecked()
	for (const corner of ['top-left', 'bottom-left']) {
		await expect(system).not.toHaveCSS(`border-${corner}-radius`, '0px')
	}
	for (const corner of ['top-right', 'bottom-right']) {
		await expect(dark).not.toHaveCSS(`border-${corner}-radius`, '0px')
	}
	for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
		await expect(light).toHaveCSS(`border-${corner}-radius`, '0px')
	}
})

test('arrow keys move the choice and the scrim or Done closes the panel', async ({ page }, info) => {
	await startGame(page)
	await openTheme(page)
	await page.keyboard.press('ArrowRight')
	await expect(page.getByRole('radio', { name: 'Light' })).toBeChecked()
	await expect(html(page)).toHaveAttribute('data-theme', 'light')
	if (info.project.name === 'compact') {
		await page.mouse.click(200, 100)
	} else {
		await page.getByRole('button', { name: 'Done' }).click()
	}
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
	await expect(page.getByRole('heading', { name: 'Place your Carrier' })).toBeVisible()
})

test('dragging the sheet down closes it on compact', async ({ page }, info) => {
	test.skip(info.project.name !== 'compact', 'the sheet is the compact window class only')
	await page.goto('./')
	await openTheme(page)
	const sheet = await page.getByRole('dialog', { name: 'Theme' }).boundingBox()
	expect(sheet).not.toBeNull()
	const x = (sheet?.x ?? 0) + 200
	const y = (sheet?.y ?? 0) + 16
	await page.mouse.move(x, y)
	await page.mouse.down()
	await page.mouse.move(x, y + 60, { steps: 4 })
	await page.mouse.move(x, y + 200, { steps: 6 })
	await page.mouse.up()
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
})

test('with reduced motion a dragged-down sheet fades where it was let go', async ({ page }, info) => {
	test.skip(info.project.name !== 'compact', 'the sheet is the compact window class only')
	await page.goto('./')
	await openTheme(page)
	const sheet = page.getByRole('dialog', { name: 'Theme' })
	const box = await sheet.boundingBox()
	expect(box).not.toBeNull()
	const x = (box?.x ?? 0) + 200
	const y = (box?.y ?? 0) + 16
	await page.mouse.move(x, y)
	await page.mouse.down()
	await page.mouse.move(x, y + 60, { steps: 4 })
	await page.mouse.move(x, y + 100, { steps: 6 })
	const released = await sheet.evaluate((popup) => popup.getBoundingClientRect().top)
	await sheet.evaluate((popup) => {
		const tops: number[] = []
		const sample = () => {
			if (popup.isConnected) {
				tops.push(popup.getBoundingClientRect().top)
				requestAnimationFrame(sample)
			}
		}
		requestAnimationFrame(sample)
		Object.assign(window, { sheetTops: tops })
	})
	await page.mouse.up()
	await expect(picker(page)).toBeHidden()
	const tops = await page.evaluate(() => (window as unknown as { sheetTops: number[] }).sheetTops)
	expect(tops.length).toBeGreaterThan(0)
	expect(Math.min(...tops)).toBeGreaterThanOrEqual(released - 1)
})

test('the choice survives a reload and colours the page before the app script runs', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	await openTheme(page)
	await page.getByRole('radio', { name: 'Dark' }).click()
	await page.route(/\/(src\/app\/main\.tsx|assets\/index-[^/]*\.js)$/, (route) => route.abort())
	await page.reload()
	await expect(themeButton(page)).toHaveCount(0)
	await expect(html(page)).toHaveAttribute('data-theme', 'dark')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await expect(page.locator('meta[data-scheme="dark"]')).toHaveAttribute('media', 'all')
	await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'dark')
	await page.unroute(/\/(src\/app\/main\.tsx|assets\/index-[^/]*\.js)$/)
	await page.reload()
	await openTheme(page)
	await expect(page.getByRole('radio', { name: 'Dark' })).toBeChecked()
})

const panelChunk = /\/(src\/shared\/components\/theme\/theme-panel\.tsx|assets\/theme-panel-[^/]*\.js)$/

async function holdPanelChunk(page: Page) {
	let release: (action: 'continue' | 'abort') => void = () => undefined
	const released = new Promise<'continue' | 'abort'>((resolve) => {
		release = resolve
	})
	await page.route(panelChunk, async (route) => {
		if ((await released) === 'abort') {
			await route.abort()
		} else {
			await route.continue()
		}
	})
	return release
}

const loading = (page: Page) => page.getByRole('progressbar', { name: 'Loading Theme' })

test('a slow Theme panel download opens the sheet or dialog loading, then the picker in it', async ({ page }, info) => {
	const release = await holdPanelChunk(page)
	await page.goto('./')
	await themeButton(page).click()
	const panel = page.getByRole('dialog', { name: 'Theme' })
	await expect(panel.getByRole('progressbar', { name: 'Loading Theme' })).toBeVisible()
	await expect(panel.getByRole('button', { name: 'Done' })).toHaveCount(info.project.name === 'compact' ? 0 : 1)
	const surface = await panel.elementHandle()
	release('continue')
	await expect(panel.getByRole('radiogroup', { name: 'Theme' })).toBeVisible()
	await expect(loading(page)).toHaveCount(0)
	expect(await panel.evaluate((node, before) => node === before, surface)).toBe(true)
})

test('closing the loading sheet or dialog cancels the open', async ({ page }, info) => {
	const release = await holdPanelChunk(page)
	await page.goto('./')
	await themeButton(page).click()
	await expect(loading(page)).toBeVisible()
	if (info.project.name === 'compact') {
		await page.keyboard.press('Escape')
	} else {
		await page.getByRole('button', { name: 'Done' }).click()
	}
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
	await expect(themeButton(page)).toBeFocused()
	const arrived = page.waitForResponse(panelChunk)
	release('continue')
	await arrived
	await page.waitForTimeout(500)
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
	await openTheme(page)
	await expect(loading(page)).toHaveCount(0)
})

test('the scrim closes the loading sheet or dialog', async ({ page }) => {
	await holdPanelChunk(page)
	await page.goto('./')
	await themeButton(page).click()
	await expect(loading(page)).toBeVisible()
	await page.mouse.click(200, 100)
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
	await expect(themeButton(page)).toBeFocused()
})

test('a download that fails while loading closes the panel and says so', async ({ page }) => {
	const release = await holdPanelChunk(page)
	await page.goto('./')
	await themeButton(page).click()
	await expect(loading(page)).toBeVisible()
	release('abort')
	await expect(page.getByText('Couldn’t open Theme. Try again.')).toBeVisible()
	await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
	await expect(themeButton(page)).toBeFocused()
	await page.unroute(panelChunk)
	await openTheme(page)
})

test('a failed Theme panel download says so and the next tap opens it', async ({ page }) => {
	const panel = panelChunk
	await page.route(panel, (route) => route.abort())
	await page.goto('./')
	await themeButton(page).click()
	await expect(page.getByText('Couldn’t open Theme. Try again.')).toBeVisible()
	await expect(picker(page)).toBeHidden()
	await page.unroute(panel)
	await openTheme(page)
})

test('the sheet stays a sheet while open when the window grows, and focus returns to Theme', async ({ page }, info) => {
	test.skip(info.project.name !== 'compact', 'the sheet is the compact window class only')
	await page.goto('./')
	await openTheme(page)
	await page.setViewportSize({ width: 1024, height: 768 })
	await expect(picker(page)).toBeVisible()
	await expect(page.getByRole('button', { name: 'Done' })).toHaveCount(0)
	await page.keyboard.press('Escape')
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
	await openTheme(page)
	await expect(page.getByRole('button', { name: 'Done' })).toBeVisible()
})

test('a choice made in another tab reaches this one', async ({ page, context }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	const other = await context.newPage()
	await other.goto('./')
	await openTheme(other)
	await other.getByRole('radio', { name: 'Dark' }).click()
	await expect(html(page)).toHaveAttribute('data-theme', 'dark')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
})

test('System follows a live change of the system theme', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' })
	await page.goto('./')
	await expect(html(page)).toHaveAttribute('data-theme', 'system')
	await expect(surface(page)).toHaveCSS('background-color', lightSurface)
	await page.emulateMedia({ colorScheme: 'dark' })
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await expect(html(page)).toHaveCSS('color-scheme', 'dark')
})

test('a storage that throws falls back to System and the picker still works', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get: () => {
				throw new DOMException('denied', 'SecurityError')
			}
		})
	})
	await page.emulateMedia({ colorScheme: 'dark' })
	await page.goto('./')
	await expect(html(page)).toHaveAttribute('data-theme', 'system')
	await expect(surface(page)).toHaveCSS('background-color', darkSurface)
	await openTheme(page)
	await page.getByRole('radio', { name: 'Light' }).click()
	await expect(surface(page)).toHaveCSS('background-color', lightSurface)
})

test('an open Theme panel stays open while the engine finishes loading', async ({ page }) => {
	let release: () => void = () => undefined
	const engineReady = new Promise<void>((resolve) => {
		release = resolve
	})
	await page.route(/battleship-engine/, async (route) => {
		await engineReady
		await route.continue()
	})
	await page.goto('./')
	await page.getByLabel('Your name').fill('Ada')
	await page.getByRole('button', { name: 'Continue' }).click()
	await expect(page.getByRole('heading', { name: 'Starting the game engine' })).toBeVisible()
	await openTheme(page)
	release()
	await expect(page.locator('h2', { hasText: 'Place your Carrier' })).toBeAttached()
	await expect(picker(page)).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(picker(page)).toBeHidden()
	await expect(themeButton(page)).toBeFocused()
})

test('the game-over dialog waits until the Theme panel has closed', async ({ page }) => {
	await page.addInitScript(() => {
		Math.random = () => 0
	})
	await page.clock.install()
	await page.emulateMedia({ reducedMotion: 'no-preference' })
	await startGame(page)
	await placeAtRandomAndStart(page)
	const over = page.getByRole('alertdialog')
	const shipsLeft = page.getByRole('grid', { name: 'Ada’s fleet' }).getByRole('gridcell', { name: /, ship$/ })
	const targets = Array.from(
		{ length: 100 },
		(_, index) => `${'JIHGFEDCBA'.charAt(Math.floor(index / 10))}${String(10 - (index % 10))}`
	)
	for (const name of targets) {
		const lastShip = (await shipsLeft.count()) === 1
		const target = cell(page, 'Enemy waters', name)
		await target.click()
		await target.click()
		if (lastShip) {
			await openTheme(page)
			await page.clock.runFor(1000)
			await expect(shipsLeft).toHaveCount(0)
			await expect(picker(page)).toBeVisible()
			await expect(over).toHaveCount(0)
			await page.clock.resume()
			await page.keyboard.press('Escape')
			await expect(picker(page)).toBeHidden()
			await expect(over).toBeVisible()
			await expect(over).toContainText('Computer wins')
			await expect(page.getByRole('dialog', { name: 'Theme' })).toHaveCount(0)
			expect(await over.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true)
			return
		}
		await page.clock.runFor(1000)
		await expect(page.getByRole('heading', { name: 'Your turn' })).toBeVisible()
	}
	throw new Error('the computer never sank the fleet')
})
