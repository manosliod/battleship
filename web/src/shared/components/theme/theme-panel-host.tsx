import { Suspense, use } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { showSnackbar } from '@/forest/components/snackbar'
import { useThemePanel, useThemePanelActions } from '@/shared/stores/theme-panel-store'

import { ThemeLoading } from './theme-loading'
import type { ThemePanelProps } from './theme-panel'
import { themePanel } from './theme-panel-loader'

const visibleThemeButton = () =>
	[...document.querySelectorAll<HTMLElement>('[data-theme-button]')].find(
		(button) => button.getClientRects().length > 0
	) ?? null

export function ThemePanelHost() {
	const panel = useThemePanel()
	const { close, closed, fail } = useThemePanelActions()

	if (!panel) {
		return null
	}
	return (
		<ErrorBoundary
			fallback={null}
			onError={() => {
				fail()
				showSnackbar('Couldn’t open Theme. Try again.')
			}}
		>
			<Suspense fallback={<ThemeLoading />}>
				<LazyThemePanel
					kind={panel.kind}
					open={panel.open}
					finalFocus={visibleThemeButton}
					onOpenChange={(open) => {
						if (!open) {
							close()
						}
					}}
					onOpenChangeComplete={(open) => {
						if (!open) {
							closed()
						}
					}}
				/>
			</Suspense>
		</ErrorBoundary>
	)
}

function LazyThemePanel(props: ThemePanelProps) {
	const { ThemePanel } = use(themePanel.load())
	return <ThemePanel {...props} />
}
