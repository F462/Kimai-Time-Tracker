import {MD3DarkTheme as PaperDefaultDarkTheme, MD3LightTheme as PaperDefaultLightTheme, PaperProvider, adaptNavigationTheme} from 'react-native-paper';
import {Appearance} from 'react-native';
import {DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
import React from 'react';
import deepmerge from 'deepmerge';

const {
	LightTheme: navigationLightTheme,
	DarkTheme: navigationDarkTheme
} = adaptNavigationTheme({reactNavigationLight: NavigationDefaultTheme, reactNavigationDark: NavigationDefaultTheme});

const paperLightTheme = {
	...PaperDefaultLightTheme,
	colors: {
		...PaperDefaultLightTheme.colors
		// TODO: define colors here
	}
};
const combinedLightTheme = deepmerge(navigationLightTheme, paperLightTheme);

const paperDarkTheme = {
	...PaperDefaultDarkTheme,
	colors: {
		...PaperDefaultDarkTheme.colors
		// TODO: define colors here
	}
};
const combinedDarkTheme = deepmerge(navigationDarkTheme, paperDarkTheme);

export const ThemeProvider = ({children}: React.PropsWithChildren<{}>) => {
	const isDarkThemeUsed = Appearance.getColorScheme() === 'dark';
	const theme = isDarkThemeUsed ? combinedDarkTheme : combinedLightTheme;

	return <PaperProvider theme={theme}>{children}</PaperProvider>;
};
