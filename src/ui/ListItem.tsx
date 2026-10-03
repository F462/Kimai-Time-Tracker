import React, {useMemo} from 'react';
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
	onLongPress,
	children,
}: React.PropsWithChildren<{
	isSelected?: boolean;
	style?: StyleProp<ViewStyle>;
	onPress?: () => void;
	onLongPress?: () => void;
}>) => {
	const combinedStyle = useMemo(() => [styles.container, style], [style]);
	return (
		<PressableOpacity
			style={combinedStyle}
			onPress={onPress}
			onLongPress={onLongPress}
			disabled={onPress === undefined}>
			{isSelected === undefined ? null : (
				<Checkbox status={isSelected ? 'checked' : 'unchecked'} />
			)}
			{children}
		</PressableOpacity>
	);
};
