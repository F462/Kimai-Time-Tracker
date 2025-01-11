import {DependencyList, useMemo} from 'react';
import {StyleSheet} from 'react-native';

export function useStyle<T extends StyleSheet.NamedStyles<T>>(
	styleObjectCreator: () => T,
	dependencies: DependencyList
): T {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => StyleSheet.create(styleObjectCreator()), dependencies);
}
