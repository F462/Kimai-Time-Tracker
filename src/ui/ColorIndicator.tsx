import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useTheme} from 'react-native-paper';

const DEFAULT_SIZE = 18;

const styles = StyleSheet.create({
	indicator: {
		borderWidth: 1.5,
		flexShrink: 0,
	},
});

export const ColorIndicator = ({
	color,
	size = DEFAULT_SIZE,
	style,
	testID,
}: {
	color: string | null;
	/**
	 * Edge length (in dp) of the indicator square. Defaults to 18. The border
	 * radius scales with the size so the indicator keeps its rounded-square
	 * appearance at any scale.
	 */
	size?: number;
	style?: StyleProp<ViewStyle>;
	testID?: string;
}) => {
	const theme = useTheme();

	if (!color) {
		return null;
	}

	return (
		<View
			testID={testID}
			style={[
				styles.indicator,
				{
					borderRadius: (size * 8) / 18,
					backgroundColor: color,
					borderColor: theme.colors.outline,
					height: size,
					width: size,
				},
				style,
			]}
		/>
	);
};
