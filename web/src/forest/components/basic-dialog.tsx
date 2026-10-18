import { Dialog } from '@base-ui/react/dialog'
import type { ReactNode } from 'react'

import { Button } from './button'
import { dialogActions, dialogPopup, dialogScrim } from './dialog-surface'

type BasicDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	action: string
	children: ReactNode
}

export function BasicDialog({ open, onOpenChange, title, action, children }: BasicDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className={dialogScrim} />
				<Dialog.Popup className={`${dialogPopup} w-max min-w-dialog`}>
					<Dialog.Title className="text-headline-small text-on-surface">{title}</Dialog.Title>
					{children}
					<div className={dialogActions}>
						<Dialog.Close render={<Button variant="text" />}>{action}</Dialog.Close>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
