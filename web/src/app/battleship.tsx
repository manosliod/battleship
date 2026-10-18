import { Activity, useState } from 'react'

import { SetupScreen } from '@/features/setup/components/setup-screen'
import { SnackbarProvider } from '@/forest/components/snackbar'

import { Game, preloadGame } from './game'

type Screen = 'setup' | 'game'

export function Battleship() {
	const [screen, setScreen] = useState<Screen>('setup')
	const [player, setPlayer] = useState('')

	return (
		<SnackbarProvider>
			<Activity mode={screen === 'setup' ? 'visible' : 'hidden'}>
				<SetupScreen
					name={player}
					onIntent={preloadGame}
					onContinue={(name) => {
						setPlayer(name)
						setScreen('game')
					}}
				/>
			</Activity>
			{screen === 'game' ? (
				<Game
					player={player}
					onLeave={() => {
						setScreen('setup')
					}}
				/>
			) : null}
		</SnackbarProvider>
	)
}
