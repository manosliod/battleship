import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
	const list = window.matchMedia(query)
	list.addEventListener('change', onChange)
	return () => {
		list.removeEventListener('change', onChange)
	}
}

const getSnapshot = () => window.matchMedia(query).matches

const getServerSnapshot = () => false

export function useReducedMotion() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
