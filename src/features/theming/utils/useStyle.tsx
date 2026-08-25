import {DependencyList, useMemo} from 'react';
import {ImageStyle, StyleSheet, TextStyle, ViewStyle} from 'react-native';

type NamedStyles<T> = {
	[P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

export function useStyle<T extends NamedStyles<T>>(
	styleObjectCreator: () => T,
	dependencies: DependencyList,
): T {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => StyleSheet.create(styleObjectCreator()), dependencies);
}
