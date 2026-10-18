import { z } from 'zod'

import { problems, snapshotSchema } from '@/shared/types/game'
import type { Engine, EngineSession } from '@/shared/types/game'

import { loadOnce } from './load-once'
import type { Loader } from './load-once'

export type EngineModule = Readonly<{
	open: () => number
	close: (session: number) => void
	place: (session: number, ship: string, row: number, column: number, across: boolean) => string
	remove: (session: number, ship: string) => void
	placeRest: (session: number) => void
	clear: (session: number) => void
	start: (session: number, name: string) => string
	fire: (session: number, row: number, column: number) => string
	rematch: (session: number) => void
	snapshot: (session: number) => string
}>

type ModuleLoader = () => Promise<EngineModule>

const loadModule: ModuleLoader = () => import('@engine/battleship-engine.js')

const sessionId = z.number().int().nonnegative()

const problem = z.union([z.literal(''), z.enum(problems)]).transform((value) => (value === '' ? null : value))

const snapshot = z
	.string()
	.transform((text, context) => {
		try {
			const parsed: unknown = JSON.parse(text)
			return parsed
		} catch {
			context.addIssue({ code: 'custom', message: 'The engine snapshot is not JSON', input: text })
			return z.NEVER
		}
	})
	.pipe(snapshotSchema)

export function adapt(module: EngineModule): Engine {
	const closed = new Set<number>()
	const release = (id: number) => {
		if (!closed.has(id)) {
			closed.add(id)
			module.close(id)
		}
	}
	const releaseOnCollect = new FinalizationRegistry<number>(release)

	return {
		openSession: () => {
			const id = sessionId.parse(module.open())
			const session: EngineSession = {
				place: ({ ship, row, column, across }) => problem.parse(module.place(id, ship, row, column, across)),
				remove: (ship) => {
					module.remove(id, ship)
				},
				placeRest: () => {
					module.placeRest(id)
				},
				clear: () => {
					module.clear(id)
				},
				start: (name) => problem.parse(module.start(id, name)),
				fire: ({ row, column }) => problem.parse(module.fire(id, row, column)),
				rematch: () => {
					module.rematch(id)
				},
				snapshot: () => snapshot.parse(module.snapshot(id)),
				close: () => {
					releaseOnCollect.unregister(session)
					release(id)
				}
			}
			releaseOnCollect.register(session, id, session)
			return session
		}
	}
}

export type EngineService = Loader<Engine>

export function createEngineService(loader: ModuleLoader = loadModule): EngineService {
	return loadOnce(async () => adapt(await loader()))
}

export const engineService = createEngineService()
