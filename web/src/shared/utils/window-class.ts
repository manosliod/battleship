const mediumBreakpoint = () => getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-medium')

export const isCompactWindow = () => !window.matchMedia(`(width >= ${mediumBreakpoint()})`).matches
