import {jest} from '@jest/globals';

jest.mock('@react-native-community/async-storage', () =>
	require('@react-native-community/async-storage/jest/async-storage-mock')
);
