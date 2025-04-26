import React from 'react';

import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Checkbox} from 'react-native-paper';

import {PressableOpacity} from './PressableOpacity';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		marginHorizontal: 10,
		marginVertical: 5,
	},
});

export const ListItem = ({
	isSelected,
	style,
	onPress,
	children,
}: React.PropsWithChildren<{
	isSelected?: boolean;
	style?: StyleProp<ViewStyle>;
	onPress?: () => void;
}>) => {
	return (
		<PressableOpacity
			style={[styles.container, style]}
			onPress={onPress}
			disabled={onPress === undefined}>
			{isSelected === undefined ? null : (
				<Checkbox status={isSelected ? 'checked' : 'unchecked'} />
			)}
			{children}
		</PressableOpacity>
	);
};
