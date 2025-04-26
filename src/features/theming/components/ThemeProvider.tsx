import {
	MD3DarkTheme as PaperDefaultDarkTheme,
	MD3LightTheme as PaperDefaultLightTheme,
	PaperProvider,
	adaptNavigationTheme,
} from 'react-native-paper';
import {Appearance} from 'react-native';
import {DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import React from 'react';
import deepmerge from 'deepmerge';
import {useIsOnWearable} from '../../utils/useIsOnWearable';

const {LightTheme: navigationLightTheme, DarkTheme: navigationDarkTheme} =
	adaptNavigationTheme({
		reactNavigationLight: NavigationDefaultTheme,
		reactNavigationDark: NavigationDefaultTheme,
	});

const paperLightTheme = {
	...PaperDefaultLightTheme,
	colors: {
		// created with https://callstack.github.io/react-native-paper/docs/guides/theming/#creating-dynamic-theme-colors
		primary: 'rgb(23, 110, 0)',
		onPrimary: 'rgb(255, 255, 255)',
		primaryContainer: 'rgb(153, 250, 122)',
		onPrimaryContainer: 'rgb(3, 33, 0)',
		error: 'rgb(186, 26, 26)',
		onError: 'rgb(255, 255, 255)',
		errorContainer: 'rgb(255, 218, 214)',
		onErrorContainer: 'rgb(65, 0, 2)',
		background: 'rgb(253, 253, 246)',
		onBackground: 'rgb(26, 28, 24)',
		surface: 'rgb(253, 253, 246)',
		onSurface: 'rgb(26, 28, 24)',
		surfaceVariant: 'rgb(223, 228, 215)',
		onSurfaceVariant: 'rgb(67, 72, 63)',
		outline: 'rgb(115, 121, 110)',
		outlineVariant: 'rgb(195, 200, 188)',
		shadow: 'rgb(0, 0, 0)',
		scrim: 'rgb(0, 0, 0)',
		inverseSurface: 'rgb(47, 49, 45)',
		inverseOnSurface: 'rgb(241, 241, 234)',
		inversePrimary: 'rgb(126, 220, 97)',
		elevation: {
			level0: 'transparent',
			level1: 'rgb(242, 246, 234)',
			level2: 'rgb(235, 242, 226)',
			level3: 'rgb(228, 237, 219)',
			level4: 'rgb(225, 236, 217)',
			level5: 'rgb(221, 233, 212)',
		},
		surfaceDisabled: 'rgba(26, 28, 24, 0.12)',
		onSurfaceDisabled: 'rgba(26, 28, 24, 0.38)',
		backdrop: 'rgba(45, 50, 41, 0.4)',
	},
};
const combinedLightTheme = deepmerge(navigationLightTheme, paperLightTheme);

const paperDarkTheme = {
	...PaperDefaultDarkTheme,
	colors: {
		// created with https://callstack.github.io/react-native-paper/docs/guides/theming/#creating-dynamic-theme-colors
		primary: 'rgb(126, 220, 97)',
		onPrimary: 'rgb(7, 57, 0)',
		primaryContainer: 'rgb(15, 83, 0)',
		onPrimaryContainer: 'rgb(153, 250, 122)',
		secondary: 'rgb(188, 203, 177)',
		onSecondary: 'rgb(39, 52, 33)',
		secondaryContainer: 'rgb(61, 75, 54)',
		onSecondaryContainer: 'rgb(215, 231, 204)',
		tertiary: 'rgb(160, 207, 209)',
		onTertiary: 'rgb(0, 55, 57)',
		tertiaryContainer: 'rgb(30, 78, 80)',
		onTertiaryContainer: 'rgb(188, 235, 237)',
		error: 'rgb(255, 180, 171)',
		onError: 'rgb(105, 0, 5)',
		errorContainer: 'rgb(147, 0, 10)',
		onErrorContainer: 'rgb(255, 180, 171)',
		background: 'rgb(26, 28, 24)',
		onBackground: 'rgb(227, 227, 220)',
		surface: 'rgb(26, 28, 24)',
		onSurface: 'rgb(227, 227, 220)',
		surfaceVariant: 'rgb(67, 72, 63)',
		onSurfaceVariant: 'rgb(195, 200, 188)',
		outline: 'rgb(141, 147, 135)',
		outlineVariant: 'rgb(67, 72, 63)',
		shadow: 'rgb(0, 0, 0)',
		scrim: 'rgb(0, 0, 0)',
		inverseSurface: 'rgb(227, 227, 220)',
		inverseOnSurface: 'rgb(47, 49, 45)',
		inversePrimary: 'rgb(23, 110, 0)',
		elevation: {
			level0: 'transparent',
			level1: 'rgb(31, 38, 28)',
			level2: 'rgb(34, 43, 30)',
			level3: 'rgb(37, 49, 32)',
			level4: 'rgb(38, 51, 33)',
			level5: 'rgb(40, 55, 34)',
		},
		surfaceDisabled: 'rgba(227, 227, 220, 0.12)',
		onSurfaceDisabled: 'rgba(227, 227, 220, 0.38)',
		backdrop: 'rgba(45, 50, 41, 0.4)',
	},
};
const combinedDarkTheme = deepmerge(navigationDarkTheme, paperDarkTheme);

export const ThemeProvider = ({children}: React.PropsWithChildren<{}>) => {
	const isOnWearable = useIsOnWearable();
	const isDarkThemeUsed =
		isOnWearable !== false || Appearance.getColorScheme() === 'dark';
	const theme = isDarkThemeUsed ? combinedDarkTheme : combinedLightTheme;

	return <PaperProvider theme={theme}>{children}</PaperProvider>;
};
