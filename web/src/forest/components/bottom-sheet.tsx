import { Drawer } from '@base-ui/react/drawer'
import type { ReactNode, RefObject } from 'react'

type BottomSheetProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	finalFocus: RefObject<HTMLElement | null>
	children: ReactNode
}

export function BottomSheet({ open, onOpenChange, title, finalFocus, children }: BottomSheetProps) {
	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Portal>
				<Drawer.Backdrop className="sheet-scrim fixed inset-0 z-20 bg-scrim" />
				<Drawer.Viewport className="fixed inset-0 z-30 flex items-end justify-center">
					<Drawer.Popup
						initialFocus
						finalFocus={finalFocus}
						className="sheet-popup w-full max-w-sheet rounded-t-extra-large bg-surface-container-low"
					>
						<div aria-hidden="true" className="flex h-handle-area items-center justify-center">
							<div className="h-handle-height w-handle-width rounded-full bg-outline" />
						</div>
						<Drawer.Content className="mx-auto flex w-fit flex-col gap-4 px-4 pt-2 pb-8">
							<Drawer.Title className="text-title-medium text-on-surface">{title}</Drawer.Title>
							{children}
						</Drawer.Content>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	)
}
