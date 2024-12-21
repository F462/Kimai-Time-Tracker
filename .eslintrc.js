module.exports = {
	root: true,
	extends: [
		'@react-native',
		'plugin:@cspell/recommended',
		'prettier'
	],
	rules: {
		indent: ['error', 'tab'],
		'@cspell/spellchecker': ['error', {}]
	}
};
