import '@testing-library/jest-dom/vitest'

import { act, cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import type * as Zustand from 'zustand'

const storeResets = new Set<() => void>()

vi.mock('zustand', async (importOriginal) => {
	const zustand = await importOriginal<typeof Zustand>()
	const createStore = (<T>(creator?: Zustand.StateCreator<T>) => {
		const resettable = (stateCreator: Zustand.StateCreator<T>) => {
			const store = zustand.createStore(stateCreator)
			storeResets.add(() => {
				store.setState(store.getInitialState(), true)
			})
			return store
		}
		return creator ? resettable(creator) : resettable
	}) as typeof Zustand.createStore
	return { ...zustand, createStore }
})

afterEach(() => {
	cleanup()
	act(() => {
		for (const reset of storeResets) {
			reset()
		}
	})
})
