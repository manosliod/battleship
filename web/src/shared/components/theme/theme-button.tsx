import { Suspense, use, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { IconButton } from '@/forest/components/icon-button'
import { themeIcons } from '@/forest/theme'
import { loadOnce } from '@/shared/services/load-once'
import { useTheme } from '@/shared/stores/theme-store'

const themePanel = loadOnce(() => import('./theme-panel'))

export function ThemeButton() {
	const theme = useTheme()
	const [open, setOpen] = useState(false)
	const [attempt, setAttempt] = useState(0)

	return (
		<>
			<IconButton
				icon={themeIcons[theme]}
				label="Theme"
				aria-haspopup="dialog"
				onClick={() => {
					themePanel.retry()
					setAttempt((current) => current + 1)
					setOpen(true)
				}}
			/>
			<ErrorBoundary fallback={null} resetKeys={[attempt]}>
				<Suspense>
					<LazyThemePanel open={open} onOpenChange={setOpen} />
				</Suspense>
			</ErrorBoundary>
		</>
	)
}

type LazyThemePanelProps = { open: boolean; onOpenChange: (open: boolean) => void }

function LazyThemePanel(props: LazyThemePanelProps) {
	const { ThemePanel } = use(themePanel.load())
	return <ThemePanel {...props} />
}
