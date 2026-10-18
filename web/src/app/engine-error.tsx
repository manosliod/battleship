import type { FallbackProps } from 'react-error-boundary'

import { AppBar } from '@/forest/components/app-bar'
import { Button } from '@/forest/components/button'
import { Icon } from '@/forest/components/icon'
import { GameActionError } from '@/shared/hooks/use-guard'

const copy = {
	load: {
		title: 'The game engine didn’t start',
		message: 'Check your connection, then try again. Your name is kept.'
	},
	game: {
		title: 'Something went wrong in the game',
		message: 'Try again to start a new game. Your name is kept.'
	}
} as const

export function EngineError({ cause, onRetry }: { cause: keyof typeof copy; onRetry: () => void }) {
	return (
		<div className="flex flex-1 flex-col">
			<AppBar title="Battleship" />
			<main role="alert" className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
				<Icon name="error" className="size-touch text-error" />
				<h2 className="text-title-large text-on-surface">{copy[cause].title}</h2>
				<p className="max-w-message text-body-medium text-on-surface-variant">{copy[cause].message}</p>
				<Button className="mt-2" onClick={onRetry}>
					Try again
				</Button>
			</main>
		</div>
	)
}

export function GameError({ error, resetErrorBoundary }: FallbackProps) {
	return <EngineError cause={error instanceof GameActionError ? 'game' : 'load'} onRetry={resetErrorBoundary} />
}
