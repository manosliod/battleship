import { Suspense, use, useRef, useState } from 'react'

import { IconButton } from '@/forest/components/icon-button'
import { showSnackbar } from '@/forest/components/snackbar'
import { themeIcons } from '@/forest/theme'
import { loadOnce } from '@/shared/services/load-once'
import { useTheme } from '@/shared/stores/theme-store'
import { isCompactWindow } from '@/shared/utils/window-class'

import { ThemeLoading } from './theme-loading'
import type { ThemePanelKind, ThemePanelProps } from './theme-panel'

const themePanel = loadOnce(() => import('./theme-panel'))

const preload = () => {
	themePanel.retry()
	themePanel.load().catch(() => undefined)
}

type Panel = Readonly<{ kind: ThemePanelKind; open: boolean }>

export function ThemeButton() {
	const theme = useTheme()
	const button = useRef<HTMLButtonElement>(null)
	const [panel, setPanel] = useState<Panel | null>(null)
	const [loading, setLoading] = useState(false)

	const open = () => {
		const kind = isCompactWindow() ? 'sheet' : 'dialog'
		themePanel.retry()
		setLoading(true)
		themePanel.load().then(
			() => {
				setLoading(false)
				setPanel({ kind, open: true })
			},
			() => {
				setLoading(false)
				showSnackbar('Couldn’t open Theme. Try again.')
			}
		)
	}

	return (
		<>
			<IconButton
				ref={button}
				icon={themeIcons[theme]}
				label="Theme"
				aria-haspopup="dialog"
				aria-busy={loading}
				onPointerEnter={preload}
				onFocus={preload}
				onClick={open}
			/>
			{loading ? <ThemeLoading /> : null}
			{panel ? (
				<Suspense fallback={<ThemeLoading />}>
					<LazyThemePanel
						kind={panel.kind}
						open={panel.open}
						finalFocus={button}
						onOpenChange={(next) => {
							setPanel({ kind: panel.kind, open: next })
						}}
					/>
				</Suspense>
			) : null}
		</>
	)
}

function LazyThemePanel(props: ThemePanelProps) {
	const { ThemePanel } = use(themePanel.load())
	return <ThemePanel {...props} />
}
