import type { KeyboardEvent, Ref } from 'react'

import { Icon } from '@/forest/components/icon'
import type { Cell } from '@/shared/types/game'
import { cellName } from '@/shared/utils/cells'

import type { CellView } from './cell-view'
import { contentLabels } from './cell-view'

type BoardCellProps = {
	cell: Cell
	view: CellView
	interactive: boolean
	tabStop: boolean
	ref?: Ref<HTMLDivElement>
	onActivate?: ((cell: Cell) => void) | undefined
	onPoint?: ((cell: Cell | null) => void) | undefined
	onKeyDown?: ((event: KeyboardEvent<HTMLDivElement>, cell: Cell) => void) | undefined
}

export function BoardCell({ cell, view, interactive, tabStop, ref, onActivate, onPoint, onKeyDown }: BoardCellProps) {
	const label = `${cellName(cell)}, ${contentLabels[view.content]}`
	if (!interactive) {
		return (
			<div role="gridcell" aria-label={label} data-content={view.content} className="board-cell">
				<CellMark content={view.content} />
			</div>
		)
	}
	return (
		<div
			ref={ref}
			role="gridcell"
			aria-label={label}
			aria-disabled={view.enabled ? undefined : true}
			aria-selected={view.content === 'aimed' ? true : undefined}
			tabIndex={tabStop ? 0 : -1}
			data-content={view.content}
			className={`board-cell ${view.enabled ? 'state-layer cursor-pointer' : ''}`}
			onClick={() => {
				onActivate?.(cell)
			}}
			onPointerEnter={(event) => {
				if (event.pointerType === 'mouse') {
					onPoint?.(cell)
				}
			}}
			onFocus={() => {
				onPoint?.(cell)
			}}
			onKeyDown={(event) => {
				onKeyDown?.(event, cell)
			}}
		>
			<CellMark content={view.content} />
		</div>
	)
}

function CellMark({ content }: { content: CellView['content'] }) {
	switch (content) {
		case 'miss':
			return <span aria-hidden="true" className="cell-dot" />
		case 'hit':
		case 'sunk':
			return <Icon name="close" className="cell-mark" />
		case 'aimed':
			return <Icon name="myLocation" className="cell-mark" />
		case 'water':
		case 'ship':
		case 'preview':
		case 'invalid':
			return null
		default: {
			const unreachable: never = content
			return unreachable
		}
	}
}
