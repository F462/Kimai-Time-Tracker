import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useTheme} from 'react-native-paper';

const styles = StyleSheet.create({
	indicator: {
		borderRadius: 8,
		borderWidth: 1.5,
		flexShrink: 0,
		height: 18,
		width: 18,
	},
});

export const ColorIndicator = ({
	color,
	style,
	testID,
}: {
	color: string | null;
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
					backgroundColor: color,
					borderColor: theme.colors.outline,
				},
				style,
			]}
		/>
	);
};
