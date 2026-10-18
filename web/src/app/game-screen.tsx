import { use, useState } from 'react'

import { BattleScreen } from '@/features/battle/components/battle-screen'
import { PlacementScreen } from '@/features/placement/components/placement-screen'
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion'
import { engineService } from '@/shared/services/engine-service'
import type { Engine } from '@/shared/types/game'
import { replyDelay } from '@/styles/motion'

export type GameScreenProps = { player: string; onLeave: () => void }

export function LoadedGame(props: GameScreenProps) {
	const engine = use(engineService.load())
	return <Game engine={engine} {...props} />
}

type Stage = Readonly<{ name: 'placing' | 'battle'; round: number }>

function Game({ engine, player, onLeave }: GameScreenProps & { engine: Engine }) {
	const [session] = useState(() => engine.openSession())
	const [stage, setStage] = useState<Stage>({ name: 'placing', round: 0 })
	const reducedMotion = useReducedMotion()

	const leave = () => {
		session.close()
		onLeave()
	}

	if (stage.name === 'placing') {
		return (
			<PlacementScreen
				key={stage.round}
				session={session}
				player={player}
				onBack={leave}
				onStart={() => {
					setStage({ name: 'battle', round: stage.round })
				}}
			/>
		)
	}
	return (
		<BattleScreen
			key={stage.round}
			session={session}
			player={player}
			replyDelay={reducedMotion ? 0 : replyDelay}
			onLeave={leave}
			onPlayAgain={() => {
				session.rematch()
				setStage({ name: 'placing', round: stage.round + 1 })
			}}
		/>
	)
}
