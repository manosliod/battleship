import { useSyncExternalStore } from 'react'

let mediumQuery: string | null = null

const query = () => {
	mediumQuery ??= `(width >= ${getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-medium').trim()})`
	return window.matchMedia(mediumQuery)
}

const subscribe = (onChange: () => void) => {
	const list = query()
	list.addEventListener('change', onChange)
	return () => {
		list.removeEventListener('change', onChange)
	}
}

const isCompact = () => !query().matches

export const useCompactWindow = () => useSyncExternalStore(subscribe, isCompact)
