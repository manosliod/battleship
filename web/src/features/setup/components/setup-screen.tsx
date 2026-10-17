import { useActionState } from 'react'
import { z } from 'zod'

import { AppBar } from '@/forest/components/app-bar'
import { Button } from '@/forest/components/button'
import { TextField } from '@/forest/components/text-field'

import { FleetCard } from './fleet-card'

export const nameError = 'Enter a name to continue.'

const nameSchema = z.string().trim().min(1)

type SetupScreenProps = { name: string; onContinue: (name: string) => void; onIntent: () => void }

type FormState = Readonly<{ name: string; error: string | null }>

export function SetupScreen({ name, onContinue, onIntent }: SetupScreenProps) {
	const [state, submit] = useActionState<FormState, FormData>(
		(_, data) => {
			const value = data.get('name')
			const raw = typeof value === 'string' ? value : ''
			const parsed = nameSchema.safeParse(raw)
			if (!parsed.success) {
				return { name: raw, error: nameError }
			}
			onContinue(parsed.data)
			return { name: raw, error: null }
		},
		{ name, error: null }
	)

	return (
		<div className="flex flex-1 flex-col">
			<AppBar title="Battleship" />
			<main className="flex flex-1 px-4 py-6 expanded:justify-center expanded:px-6 expanded:pt-16">
				<form action={submit} noValidate className="setup-layout">
					<h2 className="area-title text-headline-medium text-on-surface">Sink the fleet</h2>
					<p className="area-intro text-body-large text-on-surface-variant">
						Place five ships on a 10 × 10 grid, then take turns firing at the computer’s fleet. Sink all
						five before it sinks yours.
					</p>
					<FleetCard className="area-card" />
					<div className="area-field">
						<TextField
							name="name"
							label="Your name"
							supporting="Shown on your board."
							error={state.error}
							defaultValue={state.name}
							autoComplete="nickname"
							enterKeyHint="go"
							onFocus={onIntent}
						/>
					</div>
					<div className="area-continue flex justify-center expanded:justify-start">
						<Button type="submit" onPointerEnter={onIntent}>
							Continue
						</Button>
					</div>
				</form>
			</main>
		</div>
	)
}
