import { breakpoints } from '@/styles/breakpoints'

let mediumWindow: MediaQueryList | null = null

export const isCompactWindow = () =>
	!(mediumWindow ??= window.matchMedia(`(width >= ${String(breakpoints.medium)}px)`)).matches
