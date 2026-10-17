import { execFileSync } from 'node:child_process'

const tracked = execFileSync('git', ['ls-files', '--full-name', ':/'], { encoding: 'utf8' }).split('\n')
const javascript = tracked.filter((path) => /\.(?:js|jsx|mjs|cjs)$/.test(path))

for (const path of javascript) {
	console.log(`JavaScript file: ${path}`)
}
console.log(
	javascript.length === 0 ? 'No JavaScript files tracked.' : 'Write these in TypeScript (standards/typescript.md).'
)
process.exitCode = javascript.length === 0 ? 0 : 1
