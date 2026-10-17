import type { ReactNode } from 'react'

type AppBarProps = { title: string; leading?: ReactNode }

export function AppBar({ title, leading }: AppBarProps) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-1 px-1">
			{leading ? <div className="flex size-touch items-center justify-center">{leading}</div> : null}
			<h1 className={`flex-1 text-title-large text-on-surface ${leading ? '' : 'text-center'}`}>{title}</h1>
		</header>
	)
}
