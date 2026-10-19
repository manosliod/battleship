import { createStore, useStore } from 'zustand'

export type ThemePanelKind = 'sheet' | 'dialog'

type Panel = Readonly<{ kind: ThemePanelKind; open: boolean }>

export type ThemePanelState = Readonly<{
	panel: Panel | null
	actions: Readonly<{
		open: (kind: ThemePanelKind) => void
		close: () => void
		closed: () => void
		fail: () => void
	}>
}>

export function createThemePanelStore() {
	return createStore<ThemePanelState>()((set, get) => ({
		panel: null,
		actions: {
			open: (kind) => {
				const { panel } = get()
				set({ panel: { kind: panel?.kind ?? kind, open: true } })
			},
			close: () => {
				const { panel } = get()
				if (panel) {
					set({ panel: { kind: panel.kind, open: false } })
				}
			},
			closed: () => {
				if (get().panel?.open === false) {
					set({ panel: null })
				}
			},
			fail: () => {
				set({ panel: null })
			}
		}
	}))
}

const themePanelStore = createThemePanelStore()

export const useThemePanel = () => useStore(themePanelStore, (state) => state.panel)
export const useThemePanelShown = () => useStore(themePanelStore, (state) => state.panel !== null)
export const useThemePanelActions = () => useStore(themePanelStore, (state) => state.actions)
