import { Toast } from '@base-ui/react/toast'
import type { ReactNode } from 'react'

const snackbarManager = Toast.createToastManager()

const visibleFor = 4000

export function hideSnackbar() {
	snackbarManager.close()
}

export function showSnackbar(message: string) {
	snackbarManager.close()
	snackbarManager.add({ description: message, timeout: visibleFor })
}

function SnackbarList() {
	const { toasts } = Toast.useToastManager()
	return toasts.map((toast) => (
		<Toast.Root
			key={toast.id}
			toast={toast}
			className="snackbar flex min-h-touch items-center rounded-extra-small bg-inverse-surface px-4 py-3.5 text-body-medium text-inverse-on-surface shadow-elevation-3"
		>
			<Toast.Description />
		</Toast.Root>
	))
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
	return (
		<Toast.Provider toastManager={snackbarManager} limit={1}>
			{children}
			<Toast.Portal>
				<Toast.Viewport className="snackbar-viewport fixed inset-x-4 bottom-6 z-10 mx-auto max-w-snackbar">
					<SnackbarList />
				</Toast.Viewport>
			</Toast.Portal>
		</Toast.Provider>
	)
}
