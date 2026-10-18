import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function startGame(page: Page, name = 'Ada') {
	await page.goto('./')
	await page.getByLabel('Your name').fill(name)
	await page.getByRole('button', { name: 'Continue' }).click()
	await expect(page.getByRole('heading', { name: 'Place your Carrier' })).toBeVisible()
}

export const cell = (page: Page, grid: string, name: string) =>
	page.getByRole('grid', { name: grid }).getByRole('gridcell', { name: new RegExp(`^${name},`) })

export async function placeAtRandomAndStart(page: Page) {
	await page.getByRole('button', { name: 'Random' }).click()
	await expect(page.getByRole('heading', { name: 'Your fleet is ready' })).toBeVisible()
	await page.getByRole('button', { name: 'Start battle' }).click()
	await expect(page.getByRole('heading', { name: 'Your turn' })).toBeVisible()
}

export async function playUntilOver(page: Page) {
	const dialog = page.getByRole('alertdialog')
	const yourTurn = page.getByRole('heading', { name: 'Your turn' })
	for (const letter of 'ABCDEFGHIJ') {
		for (let row = 1; row <= 10; row++) {
			const target = cell(page, 'Enemy waters', `${letter}${String(row)}`)
			await target.click()
			await target.click()
			await expect(yourTurn.or(dialog)).toBeVisible()
			if (await dialog.isVisible()) {
				return
			}
		}
	}
}
