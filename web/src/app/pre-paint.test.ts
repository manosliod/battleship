import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { themeChoices } from '@/forest/theme'

const html = readFileSync(join(import.meta.dirname, '..', '..', 'index.html'), 'utf8')
const head = new DOMParser().parseFromString(html, 'text/html').head
const prePaint = [...head.querySelectorAll('script:not([src])')].map((script) => script.textContent).join('\n')

const run = () => {
	const script = document.createElement('script')
	script.textContent = prePaint
	document.head.append(script)
}

const metaMedia = () =>
	[...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map((meta) =>
		meta.getAttribute('media')
	)

describe('pre-paint script in index.html', () => {
	beforeEach(() => {
		document.head.innerHTML = head.innerHTML.replace(/<script[\s\S]*?<\/script>/g, '')
		localStorage.clear()
	})

	afterEach(() => {
		document.head.innerHTML = ''
		delete document.documentElement.dataset['theme']
	})

	it('knows exactly the theme choices the app offers', () => {
		const listed = /const choices = \[([^\]]*)\]/.exec(prePaint)?.[1]
		expect(listed?.split(',').map((value) => value.trim().replaceAll("'", ''))).toEqual([...themeChoices])
	})

	it.each(themeChoices)('applies a stored %s before the app runs', (choice) => {
		localStorage.setItem('theme', choice)
		run()
		expect(document.documentElement.dataset['theme']).toBe(choice)
	})

	it('pins color-scheme and theme-color to a chosen theme', () => {
		localStorage.setItem('theme', 'dark')
		run()
		expect(document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.getAttribute('content')).toBe(
			'dark'
		)
		expect(metaMedia()).toEqual(['not all', 'all'])
	})

	it('falls back to System for an unknown value and leaves the system media queries alone', () => {
		localStorage.setItem('theme', 'sepia')
		run()
		expect(document.documentElement.dataset['theme']).toBe('system')
		expect(metaMedia()).toEqual(['(prefers-color-scheme: light)', '(prefers-color-scheme: dark)'])
	})

	it('leaves no global behind', () => {
		run()
		expect('theme' in window).toBe(false)
		expect('choices' in window).toBe(false)
	})
})
