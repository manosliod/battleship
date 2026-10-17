import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { nameError, SetupScreen } from './setup-screen'

describe('SetupScreen', () => {
	it('asks for a name before going on', async () => {
		const onContinue = vi.fn()
		render(<SetupScreen name="" onContinue={onContinue} onIntent={vi.fn()} />)

		fireEvent.change(screen.getByLabelText('Your name'), { target: { value: '   ' } })
		fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

		expect(await screen.findByText(nameError)).toBeInTheDocument()
		expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true')
		expect(onContinue).not.toHaveBeenCalled()
	})

	it('goes on with the trimmed name', async () => {
		const onContinue = vi.fn()
		render(<SetupScreen name="" onContinue={onContinue} onIntent={vi.fn()} />)

		fireEvent.change(screen.getByLabelText('Your name'), { target: { value: '  Ada ' } })
		fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

		await waitFor(() => {
			expect(onContinue).toHaveBeenCalledWith('Ada')
		})
	})
})
