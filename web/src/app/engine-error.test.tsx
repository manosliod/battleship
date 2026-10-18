import { fireEvent, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { describe, expect, it, vi } from 'vitest'

import { useGuard } from '@/shared/hooks/use-guard'

import { GameError } from './engine-error'

function Broken() {
	const guard = useGuard()
	return (
		<button
			type="button"
			onClick={guard(() => {
				throw new Error('unexpected engine value')
			})}
		>
			Fire
		</button>
	)
}

function Unloaded(): never {
	throw new Error('engine download failed')
}

describe('game error screen', () => {
	it('says the game went wrong when a game action fails', () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		render(
			<ErrorBoundary FallbackComponent={GameError}>
				<Broken />
			</ErrorBoundary>
		)

		fireEvent.click(screen.getByRole('button', { name: 'Fire' }))

		expect(screen.getByRole('heading', { name: 'Something went wrong in the game' })).toBeVisible()
	})

	it('says the engine did not start when loading fails', () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		render(
			<ErrorBoundary FallbackComponent={GameError}>
				<Unloaded />
			</ErrorBoundary>
		)

		expect(screen.getByRole('heading', { name: 'The game engine didn’t start' })).toBeVisible()
	})
})
