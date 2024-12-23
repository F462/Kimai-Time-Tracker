import {jest} from '@jest/globals';

jest.mock('@react-native-community/async-storage', () =>
	require('@react-native-community/async-storage/jest/async-storage-mock')
);

// see https://react.i18next.com/misc/testing
jest.mock('react-i18next', () => ({
	useTranslation: () => ({t: key => key}),
	initReactI18next: {
		type: '3rdParty',
		init: () => {},
	}
}));

jest.mock("react-native-localize", () => ({
	findBestLanguageTag: jest.fn()
}));
