import { createStore, useStore } from 'zustand'

import type { ThemeChoice } from '@/forest/theme'
import { themeService } from '@/shared/services/theme-service'
import type { ThemeService } from '@/shared/services/theme-service'

export type ThemeState = Readonly<{
	theme: ThemeChoice
	actions: Readonly<{ choose: (theme: ThemeChoice) => void; sync: (event: StorageEvent) => void }>
}>

export function createThemeStore(service: ThemeService) {
	return createStore<ThemeState>()((set) => ({
		theme: service.read(),
		actions: {
			choose: (theme) => {
				service.save(theme)
				service.apply(theme)
				set({ theme })
			},
			sync: (event) => {
				if (event.key !== service.key && event.key !== null) {
					return
				}
				const theme = service.parse(event.newValue)
				service.apply(theme)
				set({ theme })
			}
		}
	}))
}

const themeStore = createThemeStore(themeService)

window.addEventListener('storage', themeStore.getState().actions.sync)

export const useTheme = () => useStore(themeStore, (state) => state.theme)
export const useThemeActions = () => useStore(themeStore, (state) => state.actions)
