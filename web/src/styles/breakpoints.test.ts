import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { breakpoints } from './breakpoints'

const tokens = readFileSync(join(import.meta.dirname, 'tokens.css'), 'utf8')

describe('breakpoints', () => {
	it.each(Object.entries(breakpoints))('%s matches the token in tokens.css', (name, width) => {
		expect(tokens).toContain(`--breakpoint-${name}: ${String(width)}px;`)
	})
})
