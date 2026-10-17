import { expect, test } from '@playwright/test'

test('asks for a name, then shows the placement screen', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { name: 'Sink the fleet' })).toBeVisible()

	await page.getByRole('button', { name: 'Continue' }).click()
	await expect(page.getByText('Enter a name to continue.')).toBeVisible()

	await page.getByLabel('Your name').fill('  Ada  ')
	await page.getByRole('button', { name: 'Continue' }).click()
	await expect(page.getByRole('heading', { name: 'Place your Carrier' })).toBeVisible()
})

test('keeps the name when going back from placement', async ({ page }) => {
	await page.goto('/')
	await page.getByLabel('Your name').fill('Ada')
	await page.getByRole('button', { name: 'Continue' }).click()
	await page.getByRole('button', { name: 'Back' }).click()

	await expect(page.getByLabel('Your name')).toHaveValue('Ada')
})

test('shows the engine error with a retry when the engine cannot load', async ({ page }) => {
	await page.route(/battleship-engine/, (route) => route.abort())
	await page.goto('/')
	await page.getByLabel('Your name').fill('Ada')
	await page.getByRole('button', { name: 'Continue' }).click()
	await expect(page.getByRole('heading', { name: 'The game engine didn’t start' })).toBeVisible()

	await page.unroute(/battleship-engine/)
	await page.getByRole('button', { name: 'Try again' }).click()
	await expect(page.getByRole('heading', { name: 'Place your Carrier' })).toBeVisible()
})
