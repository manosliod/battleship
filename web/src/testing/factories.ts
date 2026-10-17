import type { EngineModule } from '@/shared/services/engine-service'
import type { EngineSession, Snapshot } from '@/shared/types/game'

export const aSnapshot = (overrides: Partial<Snapshot> = {}): Snapshot => ({
	phase: 'placing',
	player: null,
	fleet: [],
	missing: ['CARRIER', 'BATTLESHIP', 'CRUISER', 'SUBMARINE', 'DESTROYER'],
	home: [],
	enemy: [],
	enemySunk: [],
	revealed: [],
	afloat: { player: [], computer: [] },
	winner: null,
	last: null,
	...overrides
})

export const aFleet = (): Snapshot['fleet'] => [
	{ ship: 'CARRIER', row: 0, column: 0, across: true },
	{ ship: 'BATTLESHIP', row: 2, column: 0, across: true },
	{ ship: 'CRUISER', row: 4, column: 0, across: true },
	{ ship: 'SUBMARINE', row: 6, column: 0, across: true },
	{ ship: 'DESTROYER', row: 8, column: 0, across: true }
]

export const aFakeModule = (overrides: Partial<EngineModule> = {}): EngineModule => ({
	open: () => 1,
	close: () => undefined,
	place: () => '',
	remove: () => undefined,
	placeRest: () => undefined,
	clear: () => undefined,
	start: () => '',
	fire: () => '',
	rematch: () => undefined,
	snapshot: () => JSON.stringify(aSnapshot()),
	...overrides
})

export const aFakeSession = (overrides: Partial<EngineSession> = {}): EngineSession => ({
	place: () => null,
	remove: () => undefined,
	placeRest: () => undefined,
	clear: () => undefined,
	start: () => null,
	fire: () => null,
	rematch: () => undefined,
	snapshot: () => aSnapshot(),
	close: () => undefined,
	...overrides
})
