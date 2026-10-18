import { describe, expect, it } from 'vitest'

import { loadOnce } from './load-once'

describe('load once', () => {
	it('shares one load between callers', async () => {
		let calls = 0
		const loader = loadOnce(() => {
			calls += 1
			return Promise.resolve(calls)
		})
		expect(await Promise.all([loader.load(), loader.load()])).toEqual([1, 1])
		expect(calls).toBe(1)
	})

	it('keeps a failure until asked to retry, so a render sees the error', async () => {
		let calls = 0
		const loader = loadOnce(() => {
			calls += 1
			return calls === 1 ? Promise.reject(new Error('offline')) : Promise.resolve('loaded')
		})
		await expect(loader.load()).rejects.toThrow('offline')
		await expect(loader.load()).rejects.toThrow('offline')
		loader.retry()
		expect(await loader.load()).toBe('loaded')
	})

	it('keeps a successful load when asked to retry', async () => {
		let calls = 0
		const loader = loadOnce(() => {
			calls += 1
			return Promise.resolve(calls)
		})
		await loader.load()
		loader.retry()
		expect(await loader.load()).toBe(1)
	})
})
