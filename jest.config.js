module.exports = {
  preset: 'react-native',
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  transformIgnorePatterns: [],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/"
  ]
};
