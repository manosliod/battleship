import { describe, expect, it } from 'vitest'

import { createThemePanelStore } from './theme-panel-store'

describe('theme panel store', () => {
	it('starts with no panel', () => {
		expect(createThemePanelStore().getState().panel).toBeNull()
	})

	it('opens the kind asked for', () => {
		const store = createThemePanelStore()
		store.getState().actions.open('sheet')
		expect(store.getState().panel).toEqual({ kind: 'sheet', open: true })
	})

	it('keeps the panel mounted until its exit has finished', () => {
		const store = createThemePanelStore()
		store.getState().actions.open('dialog')
		store.getState().actions.close()
		expect(store.getState().panel).toEqual({ kind: 'dialog', open: false })
		store.getState().actions.closed()
		expect(store.getState().panel).toBeNull()
	})

	it('reopens a closing panel with the kind it already has', () => {
		const store = createThemePanelStore()
		store.getState().actions.open('sheet')
		store.getState().actions.close()
		store.getState().actions.open('dialog')
		expect(store.getState().panel).toEqual({ kind: 'sheet', open: true })
		store.getState().actions.closed()
		expect(store.getState().panel).toEqual({ kind: 'sheet', open: true })
	})

	it('drops the panel when it fails to load', () => {
		const store = createThemePanelStore()
		store.getState().actions.open('dialog')
		store.getState().actions.fail()
		expect(store.getState().panel).toBeNull()
	})
})
