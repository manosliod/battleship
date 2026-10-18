import '@/styles/base.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { engineService } from '@/shared/services/engine-service'

import { Battleship } from './battleship'

engineService.load().catch(() => undefined)

const root = document.getElementById('app')
if (root) {
	createRoot(root).render(
		<StrictMode>
			<Battleship />
		</StrictMode>
	)
}
