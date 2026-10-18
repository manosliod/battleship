import { z } from 'zod'

import { themeChoices } from '@/forest/theme'
import type { ThemeChoice } from '@/forest/theme'

const storageKey = 'theme'
const themeSchema = z.enum(themeChoices)

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>

type ThemeServiceDeps = Readonly<{ storage: () => ThemeStorage; root: () => Document }>

export type ThemeService = Readonly<{
	read: () => ThemeChoice
	save: (theme: ThemeChoice) => void
	apply: (theme: ThemeChoice) => void
	readEvent: (event: StorageEvent) => ThemeChoice | null
}>

const metaMedia = (scheme: string | undefined, theme: ThemeChoice) => {
	if (theme === 'system') {
		return `(prefers-color-scheme: ${scheme ?? 'light'})`
	}
	return scheme === theme ? 'all' : 'not all'
}

export function createThemeService({ storage, root }: ThemeServiceDeps): ThemeService {
	const parse = (value: string | null): ThemeChoice => {
		const parsed = themeSchema.safeParse(value)
		return parsed.success ? parsed.data : 'system'
	}

	const isOwnStorage = (area: Storage | null) => {
		try {
			return area !== null && area === storage()
		} catch {
			return false
		}
	}

	return {
		read: () => {
			try {
				return parse(storage().getItem(storageKey))
			} catch {
				return 'system'
			}
		},
		save: (theme) => {
			try {
				storage().setItem(storageKey, theme)
			} catch {
				return
			}
		},
		readEvent: (event) => {
			if (!isOwnStorage(event.storageArea)) {
				return null
			}
			if (event.key === null) {
				return 'system'
			}
			return event.key === storageKey ? parse(event.newValue) : null
		},
		apply: (theme) => {
			const document = root()
			document.documentElement.dataset['theme'] = theme
			const colorScheme = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
			if (colorScheme) {
				colorScheme.setAttribute('content', theme === 'system' ? 'light dark' : theme)
			}
			for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
				meta.setAttribute('media', metaMedia(meta.dataset['scheme'], theme))
			}
		}
	}
}

export const themeService = createThemeService({ storage: () => window.localStorage, root: () => document })
