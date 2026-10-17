import { fileURLToPath, URL } from 'node:url'

import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const engineDir = fileURLToPath(new URL('../build/generated/teavm/js', import.meta.url))

export default defineConfig({
	base: process.env['BATTLESHIP_BASE'] ?? '/',
	plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'@engine': engineDir
		}
	},
	server: {
		fs: { allow: ['.', engineDir] }
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.{ts,tsx}'],
		setupFiles: ['src/testing/setup.ts']
	}
})
