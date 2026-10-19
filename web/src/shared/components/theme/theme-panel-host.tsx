import { Suspense, use, useState } from 'react'
import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { BasicDialog } from '@/forest/components/basic-dialog'
import { BottomSheet } from '@/forest/components/bottom-sheet'
import type { ModalSurfaceProps } from '@/forest/components/dialog-surface'
import { showSnackbar } from '@/forest/components/snackbar'
import type { ThemePanelKind } from '@/shared/stores/theme-panel-store'
import { useThemePanel, useThemePanelActions } from '@/shared/stores/theme-panel-store'
import { motionDuration } from '@/shared/utils/motion'

import { ThemeLoading } from './theme-loading'
import { themePanel } from './theme-panel-loader'

const visibleThemeButton = () =>
	[...document.querySelectorAll<HTMLElement>('[data-theme-button]')].find(
		(button) => button.getClientRects().length > 0
	) ?? null

const loadedOrLoadingDelay = (): Promise<unknown> | null =>
	themePanel.current()
		? null
		: Promise.race([
				themePanel.load(),
				new Promise((resolve) => {
					setTimeout(resolve, motionDuration('medium1'))
				})
			])

export function ThemePanelHost() {
	const panel = useThemePanel()
	const { fail } = useThemePanelActions()

	if (!panel) {
		return null
	}
	return (
		<ErrorBoundary
			fallback={null}
			onError={() => {
				fail()
				showSnackbar('Couldn’t open Theme. Try again.')
				visibleThemeButton()?.focus()
			}}
		>
			<ThemeSurface kind={panel.kind} open={panel.open} />
		</ErrorBoundary>
	)
}

function ThemeSurface({ kind, open }: { kind: ThemePanelKind; open: boolean }) {
	const { close, closed } = useThemePanelActions()
	const [opening] = useState(loadedOrLoadingDelay)
	const surface: ModalSurfaceProps = {
		open,
		finalFocus: visibleThemeButton,
		onOpenChange: (next) => {
			if (!next) {
				close()
			}
		},
		onOpenChangeComplete: (next) => {
			if (!next) {
				closed()
			}
		}
	}
	const content = (
		<Suspense fallback={<ThemeLoading />}>
			<LazyThemePanel />
		</Suspense>
	)

	return (
		<Suspense fallback={null}>
			<After promise={opening}>
				{kind === 'sheet' ? (
					<BottomSheet {...surface} title="Theme">
						{content}
					</BottomSheet>
				) : (
					<BasicDialog {...surface} title="Theme" action="Done">
						{content}
					</BasicDialog>
				)}
			</After>
		</Suspense>
	)
}

function After({ promise, children }: { promise: Promise<unknown> | null; children: ReactNode }) {
	if (promise) {
		use(promise)
	}
	return children
}

function LazyThemePanel() {
	const { ThemePanel } = themePanel.current() ?? use(themePanel.load())
	return <ThemePanel />
}
