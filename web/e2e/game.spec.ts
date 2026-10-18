import { expect, test } from '@playwright/test'

import { cell, placeAtRandomAndStart, playUntilOver, startGame } from './play'

test('places ships by hand, refuses an overlap and lets a ship be moved', async ({ page }) => {
	await startGame(page)
	await cell(page, 'Your waters', 'B2').click()
	await expect(page.getByRole('heading', { name: 'Place your Battleship' })).toBeVisible()

	await page.getByRole('button', { name: 'Rotate' }).click()
	await cell(page, 'Your waters', 'C1').click()
	await expect(page.getByRole('heading', { name: 'The Battleship doesn’t fit there' })).toBeVisible()
	await expect(page.getByText('It would overlap your Carrier. Pick another cell or rotate it.')).toBeVisible()

	await cell(page, 'Your waters', 'H3').click()
	await expect(page.getByRole('heading', { name: 'Place your Cruiser' })).toBeVisible()

	await cell(page, 'Your waters', 'H4').click()
	await expect(page.getByRole('heading', { name: 'Place your Battleship' })).toBeVisible()
	await expect(cell(page, 'Your waters', 'H4')).toHaveAccessibleName(/water|ship preview/)
})

test('aims, fires and sees the computer reply', async ({ page }) => {
	await startGame(page)
	await placeAtRandomAndStart(page)

	const target = cell(page, 'Enemy waters', 'F8')
	await target.click()
	await expect(page.getByText('Aim: F8')).toBeVisible()
	await page.getByRole('button', { name: 'Fire' }).click()

	await expect(cell(page, 'Enemy waters', 'F8')).toHaveAccessibleName(/^F8, (miss|hit|sunk)$/)
	await expect(page.getByRole('heading', { name: 'Your turn' })).toBeVisible()
	await expect(page.getByText(/The computer (missed|hit|sank)/)).toBeVisible()
})

test('plays a whole game, then plays again with the same name', async ({ page }) => {
	test.setTimeout(120_000)
	await startGame(page, 'Grace')
	await placeAtRandomAndStart(page)
	await playUntilOver(page)

	const dialog = page.getByRole('alertdialog')
	await expect(dialog).toBeVisible()
	await expect(dialog.getByRole('heading')).toHaveText(/You win, Grace|Computer wins/)
	await dialog.getByRole('button', { name: 'Play again' }).click()

	await expect(page.getByRole('heading', { name: 'Place your Carrier' })).toBeVisible()
})

test('asks before leaving a battle', async ({ page }) => {
	await startGame(page)
	await placeAtRandomAndStart(page)

	await page.getByRole('button', { name: 'Back' }).click()
	const dialog = page.getByRole('alertdialog', { name: 'Leave this game?' })
	await dialog.getByRole('button', { name: 'Cancel' }).click()
	await expect(page.getByRole('heading', { name: 'Your turn' })).toBeVisible()

	await page.getByRole('button', { name: 'Back' }).click()
	await dialog.getByRole('button', { name: 'Leave' }).click()
	await expect(page.getByLabel('Your name')).toHaveValue('Ada')
})
