import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'react-native-paper';

const styles = StyleSheet.create({
	indicator: {
		borderRadius: 5,
		borderWidth: StyleSheet.hairlineWidth,
		flexShrink: 0,
		height: 10,
		width: 10,
	},
});

export const ColorIndicator = ({color}: {color: string | null}) => {
	const theme = useTheme();

	if (!color) {
		return null;
	}

	return (
		<View
			style={[
				styles.indicator,
				{
					backgroundColor: color,
					borderColor: theme.colors.outline,
				},
			]}
		/>
	);
};
