import { Suspense, use } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { engineService } from '@/shared/services/engine-service'
import { loadOnce } from '@/shared/services/load-once'

import { EngineError } from './engine-error'
import { EngineLoading } from './engine-loading'
import type { GameScreenProps } from './game-screen'

const gameScreen = loadOnce(() => import('./game-screen'))

const retryAll = () => {
	engineService.retry()
	gameScreen.retry()
}

export const preloadGame = () => {
	retryAll()
	engineService.load().catch(() => undefined)
	gameScreen.load().catch(() => undefined)
}

export function Game(props: GameScreenProps) {
	return (
		<ErrorBoundary
			onReset={retryAll}
			fallbackRender={({ resetErrorBoundary }) => <EngineError onRetry={resetErrorBoundary} />}
		>
			<Suspense fallback={<EngineLoading />}>
				<LazyGame {...props} />
			</Suspense>
		</ErrorBoundary>
	)
}

function LazyGame(props: GameScreenProps) {
	const { LoadedGame } = use(gameScreen.load())
	return <LoadedGame {...props} />
}
