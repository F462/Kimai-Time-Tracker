module.exports = {
	root: true,
	extends: [
		'@react-native',
		'plugin:@cspell/recommended',
		'plugin:prettier/recommended'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.eslint.json',
		ecmaFeatures: {
			'jsx': true
		}
	},
	ignorePatterns: [
		'.eslintrc.js'
	],
	env: {
		'jest/globals': true
	},
	globals: {
		JSX: true
	},
	rules: {
		'react/no-unstable-nested-components': ['error'],
		'@cspell/spellchecker': ['error'],
		'react-native/no-unused-styles': ['error'],
		'react-native/split-platform-components': ['error'],
		'react-native/no-inline-styles': ['error'],
		'react-native/no-color-literals': ['error'],
		'react-native/no-single-element-style-arrays': ['error'],
		'@typescript-eslint/no-floating-promises': ['error'],
		'@typescript-eslint/no-misused-promises': ['error'],
		'@typescript-eslint/no-non-null-assertion': ['warn'],
		'no-shadow': 'off', // turned off because of @typescript-eslint/no-shadow
		'no-var': ['error'],
		'@typescript-eslint/no-shadow': ['error'],
		'no-use-before-define': 'off', // turned off because of @typescript-eslint/no-use-before-define
		'@typescript-eslint/no-use-before-define': ['error'],
		'no-console': ['error', { allow: ['trace', 'debug', 'info', 'warn', 'error'] }],
		'camelcase': ['error'],
		'curly': ['error', 'all'],
		'eqeqeq': ['error', 'always', {null: 'ignore'}],
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
				additionalHooks: '(useStyle)'
			}
		],
		'@cspell/spellchecker': ['error', {}],
		"sort-imports": ["error", {
			"ignoreCase": false,
			"ignoreDeclarationSort": false,
			"ignoreMemberSort": false,
			"memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
			"allowSeparatedGroups": true
		}]
	}
};
