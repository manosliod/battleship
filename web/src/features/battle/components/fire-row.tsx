import { Button } from '@/forest/components/button'
import { cellName } from '@/shared/utils/cells'

import { useAim, useBattleActions, useTurn } from '../stores/battle-store-provider'

export function FireRow({ className }: { className: string }) {
	const turn = useTurn()
	const aim = useAim()
	const { fire } = useBattleActions()
	const text =
		turn === 'over'
			? 'Game over'
			: turn === 'computer'
				? 'Wait for your turn'
				: aim
					? `Aim: ${cellName(aim)}`
					: 'Pick a cell'
	return (
		<div className={`flex items-center gap-4 ${className}`}>
			<p className="flex-1 text-body-large text-on-surface expanded:flex-none">{text}</p>
			<Button disabled={turn !== 'player' || !aim} onClick={fire}>
				Fire
			</Button>
		</div>
	)
}
