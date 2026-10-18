import type { ReactNode } from 'react'

type AppBarProps = { title: string; leading?: ReactNode; trailing?: ReactNode }

export function AppBar({ title, leading, trailing }: AppBarProps) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-1 px-1">
			{leading ? (
				<div className="flex size-touch items-center justify-center">{leading}</div>
			) : (
				<div aria-hidden="true" className="size-touch shrink-0" />
			)}
			<h1 className={`min-w-0 flex-1 text-title-large text-on-surface ${leading ? '' : 'text-center'}`}>
				{title}
			</h1>
			<div className="flex size-touch items-center justify-center">{trailing}</div>
		</header>
	)
}
