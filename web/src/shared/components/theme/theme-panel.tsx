import { ThemePicker } from '@/forest/components/theme-picker'
import { useTheme, useThemeActions } from '@/shared/stores/theme-store'

export function ThemePanel() {
	const theme = useTheme()
	const { choose } = useThemeActions()
	return <ThemePicker value={theme} onValueChange={choose} />
}
