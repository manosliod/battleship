import { useId } from 'react'

import { FleetItem } from '@/shared/components/fleet-item'

import type { FleetItemView } from '../hooks/use-fleet-items'

type FleetListProps = { title: string; items: readonly FleetItemView[]; className: string }

export function FleetList({ title, items, className }: FleetListProps) {
	const id = useId()
	return (
		<section aria-labelledby={id} className={`flex-col gap-2 ${className}`}>
			<h2 id={id} className="text-title-small text-on-surface expanded:sr-only">
				{title}
			</h2>
			<ul className="flex flex-col gap-1.5 expanded:flex-row expanded:flex-wrap expanded:gap-2">
				{items.map((item) => (
					<FleetItem key={item.ship} {...item} />
				))}
			</ul>
		</section>
	)
}
