export const motionDuration = (token: string) =>
	Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--motion-duration-${token}`))
