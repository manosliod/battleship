import { useId } from 'react'
import type { ComponentProps } from 'react'

import { Icon } from './icon'

type TextFieldProps = { label: string; supporting: string; error?: string | null | undefined } & Omit<
	ComponentProps<'input'>,
	'id' | 'placeholder'
>

export function TextField({ label, supporting, error, ...props }: TextFieldProps) {
	const id = useId()
	const supportingId = `${id}-supporting`
	return (
		<div className="flex w-full flex-col">
			<div
				className={`text-field group relative flex h-field items-center rounded-extra-small ${error ? 'invalid' : ''}`}
			>
				<input
					id={id}
					placeholder=" "
					aria-invalid={error ? true : undefined}
					aria-describedby={supportingId}
					className="peer h-full w-full bg-transparent px-4 text-body-large text-on-surface caret-primary outline-none"
					{...props}
				/>
				<span className="field-border pointer-events-none absolute inset-0 rounded-extra-small border border-outline" />
				<label
					htmlFor={id}
					className="field-label pointer-events-none absolute top-1/2 left-3 bg-surface px-1 text-body-large text-on-surface-variant"
				>
					{label}
				</label>
				{error ? <Icon name="error" className="mr-3 size-icon text-error" /> : null}
			</div>
			<p
				id={supportingId}
				className={`px-4 pt-1 text-body-small ${error ? 'text-error' : 'text-on-surface-variant'}`}
			>
				{error ?? supporting}
			</p>
		</div>
	)
}
