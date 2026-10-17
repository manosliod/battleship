import { useState } from 'react'
import type { ReactNode } from 'react'

import type { EngineSession } from '@/shared/types/game'
import { createStoreContext } from '@/shared/utils/create-store-context'

import { createBattleStore } from './battle-store'
import type { BattleState } from './battle-store'

const { StoreContext: BattleStoreContext, useStoreSelector: useBattleStore } =
	createStoreContext<BattleState>('BattleStoreProvider')

type BattleStoreProviderProps = { session: EngineSession; replyDelay: number; children: ReactNode }

export function BattleStoreProvider({ session, replyDelay, children }: BattleStoreProviderProps) {
	const [store] = useState(() => createBattleStore({ session, replyDelay }))
	return <BattleStoreContext value={store}>{children}</BattleStoreContext>
}

export const useSnapshot = () => useBattleStore((state) => state.snapshot)
export const useHomeShots = () => useBattleStore((state) => state.home)
export const useTurn = () => useBattleStore((state) => state.turn)
export const useAim = () => useBattleStore((state) => state.aim)
export const useStatus = () => useBattleStore((state) => state.status)
export const useDialog = () => useBattleStore((state) => state.dialog)
export const useBattleActions = () => useBattleStore((state) => state.actions)
