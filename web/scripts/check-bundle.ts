import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const budgets = { entry: 125_000, css: 12_000 } as const

const assets = join(import.meta.dirname, '..', 'dist', 'assets')
const gzipped = (name: string) => gzipSync(readFileSync(join(assets, name))).length
const files = readdirSync(assets)

const checks = [
	{ label: 'entry script', files: files.filter((name) => /^index-.*\.js$/.test(name)), budget: budgets.entry },
	{ label: 'stylesheet', files: files.filter((name) => name.endsWith('.css')), budget: budgets.css }
]

let failed = false
for (const check of checks) {
	const size = check.files.reduce((total, name) => total + gzipped(name), 0)
	const verdict = size <= check.budget ? 'ok' : 'over budget'
	console.log(`${check.label}: ${String(size)} B gzip (budget ${String(check.budget)} B) ${verdict}`)
	failed ||= size > check.budget || check.files.length === 0
}
process.exitCode = failed ? 1 : 0
