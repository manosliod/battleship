import { AppBar } from '@/forest/components/app-bar'
import { Button } from '@/forest/components/button'
import { Icon } from '@/forest/components/icon'

export function EngineError({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex min-h-dvh flex-col">
			<AppBar title="Battleship" />
			<main role="alert" className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
				<Icon name="error" className="size-touch text-error" />
				<h2 className="text-title-large text-on-surface">The game engine didn’t start</h2>
				<p className="max-w-message text-body-medium text-on-surface-variant">
					Check your connection, then try again. Your name is kept.
				</p>
				<Button className="mt-2" onClick={onRetry}>
					Try again
				</Button>
			</main>
		</div>
	)
}
