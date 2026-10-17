import { createContext, use } from 'react'
import { useStore } from 'zustand'
import type { StoreApi } from 'zustand'

export function createStoreContext<State>(providerName: string) {
	const StoreContext = createContext<StoreApi<State> | null>(null)

	function useStoreSelector<T>(selector: (state: State) => T): T {
		const store = use(StoreContext)
		if (!store) {
			throw new Error(`${providerName} is missing`)
		}
		return useStore(store, selector)
	}

	return { StoreContext, useStoreSelector } as const
}
