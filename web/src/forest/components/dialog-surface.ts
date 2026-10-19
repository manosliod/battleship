export type ModalSurfaceProps = Readonly<{
	open: boolean
	onOpenChange: (open: boolean) => void
	onOpenChangeComplete: (open: boolean) => void
	finalFocus: () => HTMLElement | null
}>

export const dialogScrim = 'dialog-scrim fixed inset-0 z-20 bg-scrim'

export const dialogPopup =
	'dialog-popup fixed top-1/2 left-1/2 z-30 flex -translate-1/2 flex-col gap-4 rounded-extra-large bg-surface-container-high p-6'

export const dialogActions = 'flex justify-end gap-2 pt-2'
