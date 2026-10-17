import type { ComponentProps } from 'react'

import { Icon } from './icon'
import type { IconName } from './icon'

type IconButtonProps = { icon: IconName; label: string } & Omit<ComponentProps<'button'>, 'children'>

export function IconButton({ icon, label, type = 'button', ...props }: IconButtonProps) {
	return (
		<button
			type={type}
			aria-label={label}
			className="state-layer target press relative inline-flex size-control items-center justify-center rounded-full text-on-surface-variant"
			{...props}
		>
			<Icon name={icon} />
		</button>
	)
}
