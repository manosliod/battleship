import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'

import { Icon } from './icon'
import type { IconName } from './icon'

type Option<T extends string> = Readonly<{ value: T; label: string; icon: IconName }>

type SegmentedButtonProps<T extends string> = {
	label: string
	options: readonly Option<T>[]
	value: T
	onValueChange: (value: T) => void
}

export function SegmentedButton<T extends string>({ label, options, value, onValueChange }: SegmentedButtonProps<T>) {
	return (
		<RadioGroup
			aria-label={label}
			value={value}
			onValueChange={(next) => {
				const option = options.find((candidate) => candidate.value === next)
				if (option) {
					onValueChange(option.value)
				}
			}}
			className="inline-grid h-control auto-cols-fr grid-flow-col rounded-full border border-outline"
		>
			{options.map((option) => (
				<Radio.Root
					key={option.value}
					value={option.value}
					aria-label={option.label}
					className="state-layer target relative flex cursor-pointer items-center justify-center gap-2 border-outline pr-4 pl-3 text-label-large text-on-surface first-of-type:rounded-l-full last-of-type:rounded-r-full not-first-of-type:border-l data-checked:bg-secondary-container data-checked:text-on-secondary-container"
				>
					<Icon name={option.value === value ? 'check' : option.icon} className="size-icon-small" />
					<span aria-hidden="true">{option.label}</span>
				</Radio.Root>
			))}
		</RadioGroup>
	)
}
