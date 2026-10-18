import { AppBar } from '@/forest/components/app-bar'
import { Dialog } from '@/forest/components/dialog'
import { IconButton } from '@/forest/components/icon-button'
import { Board } from '@/shared/components/board/board'
import type { EngineSession } from '@/shared/types/game'

import { useEnemyCells, useHomeCells } from '../hooks/use-board-cells'
import { useEnemyFleet, useYourFleet } from '../hooks/use-fleet-items'
import {
	BattleStoreProvider,
	useAim,
	useBattleActions,
	useDialog,
	useDisposeBattle,
	useHomeShots,
	useSnapshot,
	useTurn
} from '../stores/battle-store-provider'

import { BattleStatus } from './battle-status'
import { FireRow } from './fire-row'
import { FleetList } from './fleet-list'

type BattleScreenProps = {
	session: EngineSession
	player: string
	replyDelay: number
	onLeave: () => void
	onPlayAgain: () => void
}

export function BattleScreen({ session, replyDelay, ...props }: BattleScreenProps) {
	return (
		<BattleStoreProvider session={session} replyDelay={replyDelay}>
			<BattleContent {...props} />
		</BattleStoreProvider>
	)
}

function BattleContent({ player, onLeave, onPlayAgain }: Omit<BattleScreenProps, 'session' | 'replyDelay'>) {
	const turn = useTurn()
	const aim = useAim()
	const enemyCells = useEnemyCells()
	const homeCells = useHomeCells()
	const enemyFleet = useEnemyFleet()
	const yourFleet = useYourFleet()
	const { aim: aimAt, openLeave } = useBattleActions()
	const dispose = useDisposeBattle()
	const fleetTitle = `${player}’s fleet`

	return (
		<div className="flex flex-1 flex-col" ref={() => dispose}>
			<AppBar
				title="Battle"
				leading={<IconButton icon="arrowBack" label="Back" onClick={turn === 'over' ? onLeave : openLeave} />}
			/>
			<main className="flex flex-1 p-4 medium:p-6">
				<div className="battle-layout">
					<BattleStatus className="area-status expanded:mb-3" />
					<FireRow className="area-fire expanded:mb-3 expanded:justify-end" />
					<section
						aria-labelledby="enemy-waters"
						className="area-enemy flex flex-col gap-3 medium:gap-4 expanded:gap-3"
					>
						<h2 id="enemy-waters" className="text-title-small text-on-surface">
							Enemy waters
						</h2>
						<Board
							label="Enemy waters"
							size="large"
							cells={enemyCells}
							focusCell={aim}
							onActivate={aimAt}
							onMove={aimAt}
						/>
					</section>
					<FleetList
						title="Enemy ships"
						items={enemyFleet}
						className="area-elist flex medium:mt-9 expanded:mt-0"
					/>
					<section aria-labelledby="your-fleet" className="area-yours flex flex-col gap-2 expanded:gap-3">
						<h2 id="your-fleet" className="text-title-small wrap-anywhere text-on-surface">
							<bdi>{player}</bdi>’s fleet
						</h2>
						<Board label={fleetTitle} size="adaptive" cells={homeCells} />
					</section>
					<FleetList title="Your ships" items={yourFleet} className="area-ylist hidden medium:flex" />
				</div>
			</main>
			<BattleDialogs player={player} onLeave={onLeave} onPlayAgain={onPlayAgain} />
		</div>
	)
}

type BattleDialogsProps = { player: string; onLeave: () => void; onPlayAgain: () => void }

function BattleDialogs({ player, onLeave, onPlayAgain }: BattleDialogsProps) {
	const dialog = useDialog()
	const snapshot = useSnapshot()
	const home = useHomeShots()
	const { closeDialog } = useBattleActions()
	const onOpenChange = (open: boolean) => {
		if (!open) {
			closeDialog()
		}
	}
	const won = snapshot.winner === 'player'
	return (
		<>
			<Dialog
				open={dialog === 'over'}
				onOpenChange={onOpenChange}
				title={won ? `You win, ${player}` : 'Computer wins'}
				description={
					won
						? `You sank all 5 ships in ${String(snapshot.enemy.length)} shots.`
						: `It sank your fleet in ${String(home.length)} shots. Its remaining ships are now shown on the enemy board.`
				}
				cancel="Close"
				confirm="Play again"
				onConfirm={onPlayAgain}
			/>
			<Dialog
				open={dialog === 'leave'}
				onOpenChange={onOpenChange}
				title="Leave this game?"
				description="Your fleet and shots will be lost."
				cancel="Cancel"
				confirm="Leave"
				onConfirm={onLeave}
			/>
		</>
	)
}
