module.exports = {
	root: true,
	extends: [
		'@react-native',
		'plugin:@cspell/recommended',
		'prettier'
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
		'@typescript-eslint/comma-spacing': ['error', {before: false, after: true}],
		'no-shadow': 'off', // turned off because of @typescript-eslint/no-shadow
		'no-var': ['error'],
		'@typescript-eslint/no-shadow': ['error'],
		'no-use-before-define': 'off', // turned off because of @typescript-eslint/no-use-before-define
		'@typescript-eslint/no-use-before-define': ['error'],
		'no-console': [ // define console.log as error for debugging purposes
			'error'
		],
		'array-bracket-spacing': ['error', 'never'],
		'brace-style': ['error', '1tbs', {allowSingleLine: true}],
		'camelcase': ['error'],
		'comma-dangle': ['error', 'never'],
		'comma-spacing': ['off'], // turned off because of @typescript-eslint/comma-spacing
		'comma-style': ['error', 'last'],
		'curly': ['error', 'all'],
		'eol-last': ['error'],
		'eqeqeq': ['error', 'always', {null: 'ignore'}],
		'func-call-spacing': ['error', 'never'],
		'func-name-matching': ['error', 'always'],
		'key-spacing': [
			'error',
			{beforeColon: false, afterColon: true, mode: 'minimum'}
		],
		'keyword-spacing': ['error', {before: true, after: true}],
		'max-statements-per-line': ['error', {max: 1}],
		'no-duplicate-case': ['error'],
		'no-eval': ['error'],
		'no-labels': ['error'],
		'no-with': ['error'],
		'new-cap': ['error'],
		'no-array-constructor': ['error'],
		'no-multi-spaces': ['error', {ignoreEOLComments: true}],
		'no-multi-str': ['error'],
		'no-nested-ternary': ['error'],
		'no-new-object': ['error'],
		'no-trailing-spaces': ['error', {ignoreComments: false}],
		'no-whitespace-before-property': ['error'],
		'object-curly-spacing': ['error', 'never'],
		'object-property-newline': [
			'error',
			{allowMultiplePropertiesPerLine: true}
		],
		'operator-linebreak': [
			'error',
			'after',
			{overrides: {'?': 'before', ':': 'before'}}
		],
		'padded-blocks': ['error', 'never'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'semi-spacing': ['error', {before: false, after: true}],
		'space-before-blocks': ['error', 'always'],
		'space-in-parens': ['error', 'never'],
		'space-infix-ops': ['error'],
		'space-unary-ops': ['error', {words: true, nonwords: false}],
		'react-hooks/exhaustive-deps': [
			'error',
			{
				additionalHooks: '(useStyle)'
			}
		],
		'indent': ['error', 'tab'],
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
