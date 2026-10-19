import { loadOnce } from '@/shared/services/load-once'

export const themePanel = loadOnce(() => import('./theme-panel'))

export const preloadThemePanel = () => {
	themePanel.retry()
	themePanel.load().catch(() => undefined)
}
