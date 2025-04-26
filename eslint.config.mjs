/**
 * @file EsLint configuration for this project based on the underlying TS project.
 */

import {defineConfig, globalIgnores} from 'eslint/config';
import {FlatCompat} from '@eslint/eslintrc';
import cspell from '@cspell/eslint-plugin';
import {fileURLToPath} from 'node:url';
import jest from 'eslint-plugin-jest';
import js from '@eslint/js';
import path from 'node:path';
import react from 'eslint-plugin-react';
import reactNative from 'eslint-plugin-react-native';
import tsParser from '@typescript-eslint/parser';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores([
		'**/.eslintrc.js',
		'**/jest.config.js',
		'**/jest.setup.js',
		'.yarn/',
	]),
	{
		extends: compat.extends('@react-native', 'plugin:prettier/recommended'),

		plugins: {
			'@typescript-eslint': typescriptEslint,
			react,
			'react-native': reactNative,
			'@cspell': cspell,
		},

		languageOptions: {
			globals: {
				...jest.environments.globals.globals,
				AsyncIterableIterator: true,
				Detox: true,
				JSX: true,
			},

			parser: tsParser,
			ecmaVersion: 5,
			sourceType: 'script',

			parserOptions: {
				project: './tsconfig.json',

				ecmaFeatures: {
					jsx: true,
				},
			},
		},

		rules: {
			'react/no-unstable-nested-components': ['error'],
			'@cspell/spellchecker': ['error'],
			'react-native/no-unused-styles': ['error'],
			'react-native/split-platform-components': ['error'],
			'react-native/no-inline-styles': ['error'],
			'react-native/no-color-literals': ['error'],
			'react-native/no-single-element-style-arrays': ['error'],
			'@typescript-eslint/no-base-to-string': ['error'],
			'@typescript-eslint/no-floating-promises': ['error'],
			'@typescript-eslint/no-misused-promises': ['error'],
			'@typescript-eslint/no-non-null-assertion': ['warn'],
			'no-shadow': 'off',
			'no-var': ['error'],
			'@typescript-eslint/no-shadow': ['error'],
			'no-use-before-define': 'off',
			'@typescript-eslint/no-use-before-define': ['error'],

			// Ignore variables that start with `_`, see also https://typescript-eslint.io/rules/no-unused-vars/#faqs
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],

			'no-console': [
				'error',
				{
					allow: ['trace', 'debug', 'info', 'warn', 'error'],
				},
			],

			camelcase: ['error'],
			curly: ['error', 'all'],

			eqeqeq: [
				'error',
				'always',
				{
					null: 'ignore',
				},
			],

			'func-name-matching': ['error', 'always'],
			'no-duplicate-case': ['error'],
			'no-eval': ['error'],
			'no-labels': ['error'],
			'no-with': ['error'],
			'new-cap': ['error'],
			'no-array-constructor': ['error'],
			'no-multi-str': ['error'],
			'no-nested-ternary': ['error'],
			'no-new-object': ['error'],

			'react-hooks/exhaustive-deps': [
				'error',
				{
					additionalHooks: '(useStyle)',
				},
			],

			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['*.e2e'],
							message:
								'Do not import test files to mock functionality in production code.',
						},
					],

					paths: [
						{
							name: 'react-redux',
							importNames: ['useDispatch'],
							message: "Use 'useAppDispatch' instead.",
						},
						{
							name: '@reduxjs/toolkit',
							importNames: ['createAsyncThunk'],
							message: "Use 'createAppAsyncThunk' instead.",
						},
					],
				},
			],

			'sort-imports': [
				'error',
				{
					ignoreCase: false,
					ignoreDeclarationSort: false,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
					allowSeparatedGroups: true,
				},
			],
		},
	},
]);
