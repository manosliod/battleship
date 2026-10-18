import { AppBar } from '@/forest/components/app-bar'
import { Button } from '@/forest/components/button'
import { IconButton } from '@/forest/components/icon-button'
import { Board } from '@/shared/components/board/board'
import { ThemeButton } from '@/shared/components/theme/theme-button'
import type { EngineSession } from '@/shared/types/game'

import { usePlacementCells } from '../hooks/use-placement-cells'
import {
	PlacementStoreProvider,
	useCurrentShip,
	useFleet,
	usePlacementActions
} from '../stores/placement-store-provider'

import { PlacementFleet } from './placement-fleet'
import { PlacementStatus } from './placement-status'

type PlacementScreenProps = { session: EngineSession; player: string; onBack: () => void; onStart: () => void }

export function PlacementScreen({ session, ...props }: PlacementScreenProps) {
	return (
		<PlacementStoreProvider session={session}>
			<PlacementContent {...props} />
		</PlacementStoreProvider>
	)
}

function PlacementContent({ player, onBack, onStart }: Omit<PlacementScreenProps, 'session'>) {
	const cells = usePlacementCells()
	const fleet = useFleet()
	const current = useCurrentShip()
	const { tapCell, point, rotate, random, reset, start } = usePlacementActions()
	const ready = current === null

	return (
		<div className="flex flex-1 flex-col">
			<AppBar
				title="Place your fleet"
				leading={<IconButton icon="arrowBack" label="Back" onClick={onBack} />}
				trailing={<ThemeButton />}
			/>
			<main className="flex flex-1 px-4 pt-4 pb-6 expanded:justify-center expanded:p-6">
				<div className="placement-layout">
					<PlacementStatus className="area-status" />
					<div className="area-board">
						<Board label="Your waters" size="large" cells={cells} onActivate={tapCell} onPoint={point} />
					</div>
					<div className="area-actions flex flex-wrap gap-2">
						<Button variant="outlined" icon="rotateRight" disabled={ready} onClick={rotate}>
							Rotate
						</Button>
						<Button variant="outlined" icon="shuffle" onClick={random}>
							Random
						</Button>
						<Button variant="text" icon="restartAlt" disabled={fleet.length === 0} onClick={reset}>
							Reset
						</Button>
					</div>
					<PlacementFleet className="area-fleet" />
					<div className="area-start flex justify-center expanded:justify-start">
						<Button
							disabled={!ready}

							onClick={() => {
								if (start(player) === 'started') {
									onStart()
								}
							}}
						>
							Start battle
						</Button>
					</div>
				</div>
			</main>
		</div>
	)
}
