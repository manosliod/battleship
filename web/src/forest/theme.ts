import type { IconName } from './components/icon'

export const themeChoices = ['system', 'light', 'dark'] as const

export type ThemeChoice = (typeof themeChoices)[number]

export const themeIcons = {
	system: 'brightnessAuto',
	light: 'lightMode',
	dark: 'darkMode'
} as const satisfies Record<ThemeChoice, IconName>

export const themeLabels = {
	system: 'System',
	light: 'Light',
	dark: 'Dark'
} as const satisfies Record<ThemeChoice, string>
