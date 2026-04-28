module.exports = {
	preset: '@react-native/jest-preset',
	setupFiles: [
		'./node_modules/react-native-gesture-handler/jestSetup.js',
		'./jest.setup.js'
	],
	transform: {
		'^.+\\.ts?$': 'ts-jest',
		'^.+\\.(js|jsx)$': 'babel-jest'
	},
	transformIgnorePatterns: [],
	testPathIgnorePatterns: ['<rootDir>/node_modules/']
};
