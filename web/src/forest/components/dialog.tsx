import { AlertDialog } from '@base-ui/react/alert-dialog'

import { Button } from './button'

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
				<AlertDialog.Backdrop className="dialog-scrim fixed inset-0 z-20 bg-scrim" />
				<AlertDialog.Popup className="dialog-popup fixed top-1/2 left-1/2 z-30 flex w-dialog -translate-1/2 flex-col gap-4 rounded-extra-large bg-surface-container-high p-6">
					<AlertDialog.Title className="text-headline-small text-on-surface">{title}</AlertDialog.Title>
					<AlertDialog.Description className="text-body-medium text-on-surface-variant">
						{description}
					</AlertDialog.Description>
					<div className="flex justify-end gap-2 pt-2">
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
