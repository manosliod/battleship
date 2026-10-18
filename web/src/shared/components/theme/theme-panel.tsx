import { BasicDialog } from '@/forest/components/basic-dialog'
import { BottomSheet } from '@/forest/components/bottom-sheet'
import { ThemePicker } from '@/forest/components/theme-picker'
import { useCompactWindow } from '@/shared/hooks/use-compact-window'
import { useTheme, useThemeActions } from '@/shared/stores/theme-store'

type ThemePanelProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function ThemePanel({ open, onOpenChange }: ThemePanelProps) {
	const theme = useTheme()
	const { choose } = useThemeActions()
	const compact = useCompactWindow()
	const picker = <ThemePicker value={theme} onValueChange={choose} />

	return compact ? (
		<BottomSheet open={open} onOpenChange={onOpenChange} title="Theme">
			{picker}
		</BottomSheet>
	) : (
		<BasicDialog open={open} onOpenChange={onOpenChange} title="Theme" action="Done">
			{picker}
		</BasicDialog>
	)
}
