import { AlertDialog } from '@base-ui/react/alert-dialog'

import { Button } from './button'
import { dialogActions, dialogPopup, dialogScrim } from './dialog-surface'

type DialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description: string
	cancel: string
	confirm: string
	onConfirm: () => void
}

export function Dialog({ open, onOpenChange, title, description, cancel, confirm, onConfirm }: DialogProps) {
	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className={dialogScrim} />
				<AlertDialog.Popup className={`${dialogPopup} w-dialog`}>
					<AlertDialog.Title className="text-headline-small wrap-anywhere text-on-surface">
						{title}
					</AlertDialog.Title>
					<AlertDialog.Description className="text-body-medium text-on-surface-variant">
						{description}
					</AlertDialog.Description>
					<div className={dialogActions}>
						<AlertDialog.Close render={<Button variant="text" />}>{cancel}</AlertDialog.Close>
						<AlertDialog.Close render={<Button variant="text" onClick={onConfirm} />}>
							{confirm}
						</AlertDialog.Close>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
