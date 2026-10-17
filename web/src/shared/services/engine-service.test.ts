import { describe, expect, it, vi } from 'vitest'

import { aFakeModule } from '@/testing/factories'

import { adapt, createEngineService } from './engine-service'

describe('engine service', () => {
	it('plays through the real engine', async () => {
		const engine = await createEngineService().load()
		const session = engine.openSession()

		expect(session.place({ ship: 'CARRIER', row: 0, column: 6, across: true })).toBe('OFF_BOARD')
		expect(session.place({ ship: 'CARRIER', row: 0, column: 0, across: true })).toBeNull()
		expect(session.place({ ship: 'DESTROYER', row: 0, column: 3, across: false })).toBe('OVERLAP')
		expect(session.start('Ada')).toBe('FLEET_INCOMPLETE')

		session.placeRest()
		expect(session.start(' ')).toBe('BLANK_NAME')
		expect(session.start('Ada')).toBeNull()
		expect(session.fire({ row: 9, column: 9 })).toBeNull()
		expect(session.fire({ row: 9, column: 9 })).toBe('ALREADY_FIRED')

		const snapshot = session.snapshot()
		expect(snapshot.phase).toBe('battle')
		expect(snapshot.player).toBe('Ada')
		expect(snapshot.enemy).toHaveLength(1)
		expect(snapshot.home).toHaveLength(1)
		expect(snapshot.last?.yours).toMatchObject({ row: 9, column: 9 })
		session.close()
	})

	it('rejects values the engine should never return', () => {
		const engine = adapt(aFakeModule({ place: () => 'SINKING', snapshot: () => '{"phase":"lost"}' }))
		const session = engine.openSession()

		expect(() => session.place({ ship: 'CARRIER', row: 0, column: 0, across: true })).toThrow()
		expect(() => session.snapshot()).toThrow()
	})

	it('closes a session once', () => {
		const close = vi.fn()
		const session = adapt(aFakeModule({ close })).openSession()

		session.close()
		session.close()

		expect(close).toHaveBeenCalledTimes(1)
	})

	it('can retry after the module fails to load', async () => {
		const loader = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(aFakeModule())
		const service = createEngineService(loader)

		await expect(service.load()).rejects.toThrow('offline')
		service.retry()
		await expect(service.load()).resolves.toBeDefined()
	})
})
