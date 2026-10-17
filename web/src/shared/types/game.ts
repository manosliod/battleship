import { z } from 'zod'

export const ships = ['CARRIER', 'BATTLESHIP', 'CRUISER', 'SUBMARINE', 'DESTROYER'] as const

export type Ship = (typeof ships)[number]

export const shipLength = {
	CARRIER: 5,
	BATTLESHIP: 4,
	CRUISER: 3,
	SUBMARINE: 3,
	DESTROYER: 2
} as const satisfies Record<Ship, number>

export const shipName = {
	CARRIER: 'Carrier',
	BATTLESHIP: 'Battleship',
	CRUISER: 'Cruiser',
	SUBMARINE: 'Submarine',
	DESTROYER: 'Destroyer'
} as const satisfies Record<Ship, string>

export const boardSize = 10

const index = z
	.number()
	.int()
	.min(0)
	.max(boardSize - 1)

const ship = z.enum(ships)

const result = z.enum(['miss', 'hit', 'sunk'])

export const placementSchema = z.object({ ship, row: index, column: index, across: z.boolean() })

const shotSchema = z.object({ row: index, column: index, result })

const exchangeShotSchema = shotSchema.extend({ ship: ship.nullable() })

export const snapshotSchema = z.object({
	phase: z.enum(['placing', 'battle', 'over']),
	player: z.string().nullable(),
	fleet: z.array(placementSchema).readonly(),
	missing: z.array(ship).readonly(),
	home: z.array(shotSchema).readonly(),
	enemy: z.array(shotSchema).readonly(),
	enemySunk: z.array(placementSchema).readonly(),
	revealed: z.array(placementSchema).readonly(),
	afloat: z.object({ player: z.array(ship).readonly(), computer: z.array(ship).readonly() }),
	winner: z.enum(['player', 'computer']).nullable(),
	last: z.object({ yours: exchangeShotSchema, reply: exchangeShotSchema.nullable() }).nullable()
})

export const problems = [
	'OFF_BOARD',
	'OVERLAP',
	'ALREADY_PLACED',
	'UNKNOWN_SHIP',
	'BATTLE_STARTED',
	'BLANK_NAME',
	'FLEET_INCOMPLETE',
	'NOT_STARTED',
	'ALREADY_FIRED',
	'GAME_OVER'
] as const

export type Problem = (typeof problems)[number]

export type Cell = Readonly<{ row: number; column: number }>

export type Placement = Readonly<z.infer<typeof placementSchema>>

export type ShotResult = z.infer<typeof result>

export type Shot = Readonly<z.infer<typeof shotSchema>>

export type Snapshot = Readonly<z.infer<typeof snapshotSchema>>

export type EngineSession = Readonly<{
	place: (placement: Placement) => Problem | null
	remove: (ship: Ship) => void
	placeRest: () => void
	clear: () => void
	start: (name: string) => Problem | null
	fire: (cell: Cell) => Problem | null
	rematch: () => void
	snapshot: () => Snapshot
	close: () => void
}>

export type Engine = Readonly<{ openSession: () => EngineSession }>
