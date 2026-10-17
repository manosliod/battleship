import type { ComponentProps } from 'react'

import { Icon } from './icon'
import type { IconName } from './icon'

type ButtonProps = { variant?: 'filled' | 'outlined' | 'text'; icon?: IconName } & ComponentProps<'button'>

const variants = {
	filled: 'bg-primary text-on-primary disabled:bg-on-surface/10 disabled:text-on-surface/38',
	outlined:
		'border border-outline-variant text-on-surface-variant disabled:border-transparent disabled:bg-on-surface/10 disabled:text-on-surface/38',
	text: 'text-primary disabled:bg-on-surface/10 disabled:text-on-surface/38'
} as const satisfies Record<NonNullable<ButtonProps['variant']>, string>

const iconColours = {
	filled: '',
	outlined: 'text-primary group-disabled:text-current',
	text: ''
} as const satisfies Record<NonNullable<ButtonProps['variant']>, string>

export function Button({ variant = 'filled', icon, type = 'button', className = '', children, ...props }: ButtonProps) {
	const padding = icon ? (variant === 'text' ? 'pr-4 pl-3' : 'pr-6 pl-4') : variant === 'text' ? 'px-3' : 'px-4'
	return (
		<button
			type={type}
			className={`group state-layer target press relative inline-flex h-control shrink-0 items-center justify-center gap-2 rounded-full text-label-large disabled:cursor-default ${padding} ${variants[variant]} ${className}`}
			{...props}
		>
			{icon ? <Icon name={icon} className={`size-icon-small ${iconColours[variant]}`} /> : null}
			{children}
		</button>
	)
}
