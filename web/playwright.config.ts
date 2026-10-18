import { defineConfig, devices } from '@playwright/test'

const liveUrl = process.env['E2E_BASE_URL']

export default defineConfig({
	testDir: 'e2e',
	forbidOnly: !!process.env['CI'],
	reporter: process.env['CI'] ? 'github' : 'list',
	use: { baseURL: liveUrl ?? 'http://localhost:4173', reducedMotion: 'reduce' },
	projects: [
		{ name: 'compact', use: { ...devices['Desktop Chrome'], viewport: { width: 412, height: 917 } } },
		{ name: 'expanded', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } }
	],
	...(liveUrl === undefined && {
		webServer: {
			command: 'pnpm build && pnpm preview --port 4173 --strictPort',
			port: 4173,
			reuseExistingServer: !process.env['CI']
		}
	})
})
