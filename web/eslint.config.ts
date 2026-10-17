import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import checkFile from 'eslint-plugin-check-file'
import { importX } from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const effects = {
	name: 'react',
	importNames: ['useEffect', 'useLayoutEffect', 'useInsertionEffect'],
	message: 'Effects live only in src/shared/hooks (standards/react.md, "Effects").'
}

export default defineConfig(
	{ ignores: ['dist', 'playwright-report', 'test-results'] },
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
			reactHooks.configs.flat.recommended,
			jsxA11y.configs.recommended
		],
		languageOptions: { parserOptions: { projectService: true } },
		plugins: { 'import-x': importX, 'check-file': checkFile },
		rules: {
			'no-restricted-imports': ['error', { paths: [effects] }],
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'import-x/no-default-export': 'error',
			'import-x/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
					pathGroups: [{ pattern: '@/**', group: 'internal' }],
					'newlines-between': 'always',
					alphabetize: { order: 'asc' }
				}
			],
			'import-x/no-restricted-paths': [
				'error',
				{
					zones: [
						{ target: './src/features/setup', from: './src/features', except: ['./setup'] },
						{ target: './src/features/placement', from: './src/features', except: ['./placement'] },
						{ target: './src/features/battle', from: './src/features', except: ['./battle'] },
						{ target: './src/features', from: './src/app' },
						{ target: ['./src/shared', './src/forest'], from: ['./src/features', './src/app'] },
						{ target: './src/forest', from: './src/shared' }
					]
				}
			],
			'check-file/filename-naming-convention': [
				'error',
				{ 'src/**/*.{ts,tsx}': 'KEBAB_CASE', 'e2e/**/*.ts': 'KEBAB_CASE' },
				{ ignoreMiddleExtensions: true }
			],
			'check-file/folder-naming-convention': ['error', { 'src/**/': 'KEBAB_CASE' }]
		}
	},
	{
		files: ['src/shared/hooks/**'],
		rules: { 'no-restricted-imports': 'off' }
	},
	{
		files: ['*.config.ts'],
		rules: { 'import-x/no-default-export': 'off' }
	},
	prettier
)
