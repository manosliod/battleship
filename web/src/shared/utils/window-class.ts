import { breakpoints } from '@/styles/breakpoints'

export const isCompactWindow = () => !window.matchMedia(`(width >= ${String(breakpoints.medium)}px)`).matches
