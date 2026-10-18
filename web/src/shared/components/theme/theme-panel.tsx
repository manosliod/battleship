import type { RefObject } from 'react'

import { BasicDialog } from '@/forest/components/basic-dialog'
import { BottomSheet } from '@/forest/components/bottom-sheet'
import { ThemePicker } from '@/forest/components/theme-picker'
import { useTheme, useThemeActions } from '@/shared/stores/theme-store'

export type ThemePanelKind = 'sheet' | 'dialog'

export type ThemePanelProps = {
	kind: ThemePanelKind
	open: boolean
	onOpenChange: (open: boolean) => void
	finalFocus: RefObject<HTMLElement | null>
}

export function ThemePanel({ kind, open, onOpenChange, finalFocus }: ThemePanelProps) {
	const theme = useTheme()
	const { choose } = useThemeActions()
	const picker = <ThemePicker value={theme} onValueChange={choose} />

	return kind === 'sheet' ? (
		<BottomSheet open={open} onOpenChange={onOpenChange} title="Theme" finalFocus={finalFocus}>
			{picker}
		</BottomSheet>
	) : (
		<BasicDialog open={open} onOpenChange={onOpenChange} title="Theme" action="Done" finalFocus={finalFocus}>
			{picker}
		</BasicDialog>
	)
}
