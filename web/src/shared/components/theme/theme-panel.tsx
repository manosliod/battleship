import { BasicDialog } from '@/forest/components/basic-dialog'
import { BottomSheet } from '@/forest/components/bottom-sheet'
import { ThemePicker } from '@/forest/components/theme-picker'
import type { ThemePanelKind } from '@/shared/stores/theme-panel-store'
import { useTheme, useThemeActions } from '@/shared/stores/theme-store'

export type ThemePanelProps = {
	kind: ThemePanelKind
	open: boolean
	onOpenChange: (open: boolean) => void
	onOpenChangeComplete: (open: boolean) => void
	finalFocus: () => HTMLElement | null
}

export function ThemePanel({ kind, ...surface }: ThemePanelProps) {
	const theme = useTheme()
	const { choose } = useThemeActions()
	const picker = <ThemePicker value={theme} onValueChange={choose} />

	return kind === 'sheet' ? (
		<BottomSheet {...surface} title="Theme">
			{picker}
		</BottomSheet>
	) : (
		<BasicDialog {...surface} title="Theme" action="Done">
			{picker}
		</BasicDialog>
	)
}
