import { Activity, useState } from 'react'

import { SetupScreen } from '@/features/setup/components/setup-screen'
import { SnackbarProvider } from '@/forest/components/snackbar'

import { Game, preloadGame } from './game'

type Screen = Readonly<{ name: 'setup' }> | Readonly<{ name: 'game'; game: number }>

export function Battleship() {
	const [screen, setScreen] = useState<Screen>({ name: 'setup' })
	const [player, setPlayer] = useState('')
	const [games, setGames] = useState(0)

	return (
		<SnackbarProvider>
			<Activity mode={screen.name === 'setup' ? 'visible' : 'hidden'}>
				<SetupScreen
					name={player}
					onIntent={preloadGame}
					onContinue={(name) => {
						setPlayer(name)
						setGames((count) => count + 1)
						setScreen({ name: 'game', game: games + 1 })
					}}
				/>
			</Activity>
			{screen.name === 'game' ? (
				<Game
					key={screen.game}
					player={player}
					onLeave={() => {
						setScreen({ name: 'setup' })
					}}
				/>
			) : null}
		</SnackbarProvider>
	)
}
