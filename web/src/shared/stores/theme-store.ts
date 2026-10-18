import { createStore, useStore } from 'zustand'

import type { ThemeChoice } from '@/forest/theme'
import { themeService } from '@/shared/services/theme-service'
import type { ThemeService } from '@/shared/services/theme-service'

export type ThemeState = Readonly<{
	theme: ThemeChoice
	actions: Readonly<{ choose: (theme: ThemeChoice) => void }>
}>

type StorageEvents = Pick<EventTarget, 'addEventListener' | 'removeEventListener'>

export function createThemeStore(service: ThemeService, events: StorageEvents) {
	const store = createStore<ThemeState>()((set) => ({
		theme: service.read(),
		actions: {
			choose: (theme) => {
				service.save(theme)
				service.apply(theme)
				set({ theme })
			}
		}
	}))

	const onStorage = (event: Event) => {
		const theme = event instanceof StorageEvent ? service.readEvent(event) : null
		if (theme !== null) {
			service.apply(theme)
			store.setState({ theme })
		}
	}

	let subscribers = 0

	const subscribe: typeof store.subscribe = (listener) => {
		subscribers += 1
		if (subscribers === 1) {
			events.addEventListener('storage', onStorage)
		}
		const unsubscribe = store.subscribe(listener)
		return () => {
			unsubscribe()
			subscribers -= 1
			if (subscribers === 0) {
				events.removeEventListener('storage', onStorage)
			}
		}
	}

	return { ...store, subscribe }
}

const themeStore = createThemeStore(themeService, window)

export const useTheme = () => useStore(themeStore, (state) => state.theme)
export const useThemeActions = () => useStore(themeStore, (state) => state.actions)
