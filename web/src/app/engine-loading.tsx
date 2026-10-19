import { AppBar } from '@/forest/components/app-bar'
import { LoadingIndicator } from '@/forest/components/loading-indicator'
import { ThemeButton } from '@/shared/components/theme/theme-button'

export function EngineLoading() {
	return (
		<div className="flex flex-1 flex-col">
			<AppBar title="Battleship" trailing={<ThemeButton />} />
			<main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
				<LoadingIndicator />
				<h2 className="text-title-large text-on-surface">Starting the game engine</h2>
				<p className="max-w-message text-body-medium text-on-surface-variant">
					The Java engine loads in your browser. The first time takes a moment.
				</p>
			</main>
		</div>
	)
}
