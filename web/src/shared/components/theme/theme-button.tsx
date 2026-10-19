import { IconButton } from '@/forest/components/icon-button'
import { themeIcons } from '@/forest/theme'
import { useThemePanelActions } from '@/shared/stores/theme-panel-store'
import { useTheme } from '@/shared/stores/theme-store'
import { isCompactWindow } from '@/shared/utils/window-class'

import { preloadThemePanel, themePanel } from './theme-panel-loader'

export function ThemeButton() {
	const theme = useTheme()
	const { open } = useThemePanelActions()

	return (
		<IconButton
			data-theme-button=""
			icon={themeIcons[theme]}
			label="Theme"
			aria-haspopup="dialog"
			onPointerEnter={preloadThemePanel}
			onFocus={preloadThemePanel}
			onClick={() => {
				themePanel.retry()
				open(isCompactWindow() ? 'sheet' : 'dialog')
			}}
		/>
	)
}
