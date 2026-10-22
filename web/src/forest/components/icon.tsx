import type { CSSProperties } from 'react'

import type { IconName } from './icons'
import { icons } from './icons'

export type { IconName } from './icons'

type IconProps = { name: IconName; className?: string }

export function Icon({ name, className = 'size-icon' }: IconProps) {
	const style = { '--icon': `url(${JSON.stringify(icons[name])})` } as CSSProperties
	return <span aria-hidden="true" className={`icon shrink-0 bg-current ${className}`} style={style} />
}
