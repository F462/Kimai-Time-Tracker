import {jest} from '@jest/globals';

jest.mock('@react-native-community/async-storage', () =>
	require('@react-native-community/async-storage/jest/async-storage-mock')
);

// see https://react.i18next.com/misc/testing
jest.mock('react-i18next', () => ({
	useTranslation: () => ({t: key => key}),
	initReactI18next: {
		type: '3rdParty',
		init: () => {}
	}
}));

jest.mock('react-native-localize', () => ({
	findBestLanguageTag: jest.fn()
}));

jest.mock('react-native-encrypted-storage', () => ({
	setItem: jest.fn(() => Promise.resolve()),
	getItem: jest.fn(() => Promise.resolve(null)),
	removeItem: jest.fn(() => Promise.resolve()),
	clear: jest.fn(() => Promise.resolve())
}));

jest.mock('react-native-bootsplash', () => {
	return {
		hide: jest.fn().mockResolvedValue(),
		isVisible: jest.fn().mockResolvedValue(false),
		useHideAnimation: jest.fn().mockReturnValue({
			container: {},
			logo: {source: 0},
			brand: {source: 0}
		})
	};
});

// see https://github.com/react-native-device-info/react-native-device-info/issues/1101#issuecomment-1007340089
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
jest.mock('react-native-device-info', () => mockRNDeviceInfo);

