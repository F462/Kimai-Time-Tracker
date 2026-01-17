import {jest} from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () =>
	require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-worklets', () =>
	require('react-native-worklets/lib/module/mock')
);

// see https://react.i18next.com/misc/testing
jest.mock('react-i18next', () => ({
	useTranslation: () => ({t: key => key, i18n: {language: 'en'}}),
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

// see https://www.npmjs.com/package/@react-native-community/netinfo
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

jest.mock('src/assets/license.txt', () => '');
jest.mock('react-native-local-resource', () => {
	return jest.fn().mockReturnValue(Promise.resolve('mockValue'));
});

// see https://github.com/react-native-share/react-native-share/issues/598
jest.mock('react-native-share', () => ({
	default: jest.fn()
}));

jest.mock('react-native-zip-archive', () => ({
	zip: jest.fn()
}));

// see https://gist.github.com/sipamungkas/8922cded82ac909cd62369957eb17c81
jest.mock('react-native-blob-util', () => {
	return {
		__esModule: true,
		default: {
			DocumentDir: jest.fn(),
			config: jest.fn(() => ({
				fetch: jest.fn(() => ({
					progress: jest.fn().mockResolvedValue(true)
				}))
			})),
			fs: {
				cp: jest.fn().mockResolvedValue(true),
				dirs: {
					CacheDir: '/mockCacheDir'
				},
				unlink: jest.fn()
			}
		}
	};
});

jest.mock('react-native-file-logger', () => ({
	FileLogger: {
		configure: jest.fn(() => Promise.resolve()),
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn()
	}
}));

// to fix RN 0.80 bug, see https://github.com/facebook/react-native/issues/51993
jest.mock('react-native/Libraries/Components/RefreshControl/RefreshControl', () => ({
  __esModule: true,
  default: require('./__mocks__/RefreshControlMock'),
}));