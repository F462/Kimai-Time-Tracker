const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

const {
	wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
	transformer: {
		babelTransformerPath: require.resolve(
			'react-native-svg-transformer/react-native',
		),
	},
	resolver: {
		assetExts: [...assetExts.filter((ext) => ext !== 'svg'), 'txt'],
		sourceExts: [...sourceExts, 'svg'],
	},
};

module.exports = wrapWithReanimatedMetroConfig(
	mergeConfig(defaultConfig, config),
);
