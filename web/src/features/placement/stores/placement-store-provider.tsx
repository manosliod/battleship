import { useState } from 'react'
import type { ReactNode } from 'react'

import { useGuard } from '@/shared/hooks/use-guard'
import type { EngineSession } from '@/shared/types/game'
import { createStoreContext } from '@/shared/utils/create-store-context'

import { createPlacementStore } from './placement-store'
import type { PlacementState } from './placement-store'

const { StoreContext: PlacementStoreContext, useStoreSelector: usePlacementStore } =
	createStoreContext<PlacementState>('PlacementStoreProvider')

type PlacementStoreProviderProps = { session: EngineSession; children: ReactNode }

export function PlacementStoreProvider({ session, children }: PlacementStoreProviderProps) {
	const [store] = useState(() => createPlacementStore(session))
	return <PlacementStoreContext value={store}>{children}</PlacementStoreContext>
}

export const useFleet = () => usePlacementStore((state) => state.fleet)
export const useCurrentShip = () => usePlacementStore((state) => state.current)
export const useAcross = () => usePlacementStore((state) => state.across)
export const usePointer = () => usePlacementStore((state) => state.pointer)
export const useRefusal = () => usePlacementStore((state) => state.refusal)
export function usePlacementActions() {
	const actions = usePlacementStore((state) => state.actions)
	const guard = useGuard()
	return {
		tapCell: guard(actions.tapCell),
		point: guard(actions.point),
		rotate: guard(actions.rotate),
		random: guard(actions.random),
		reset: guard(actions.reset),
		start: guard(actions.start)
	}
}
