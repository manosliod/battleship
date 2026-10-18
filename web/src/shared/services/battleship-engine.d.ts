declare module '@engine/battleship-engine.js' {
	export function open(): number
	export function close(session: number): void
	export function place(session: number, ship: string, row: number, column: number, across: boolean): string
	export function remove(session: number, ship: string): void
	export function placeRest(session: number): void
	export function clear(session: number): void
	export function start(session: number, name: string): string
	export function fire(session: number, row: number, column: number): string
	export function rematch(session: number): void
	export function snapshot(session: number): string
}
