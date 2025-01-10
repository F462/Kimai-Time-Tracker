import React from 'react';

import {Checkbox} from 'react-native-paper';
import {StyleSheet} from 'react-native';

import {PressableOpacity} from './PressableOpacity';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginHorizontal: 10,
		marginVertical: 5
	}
});

export const ListItem = ({isSelected, onPress, children}: React.PropsWithChildren<{isSelected?: boolean; onPress?: () => void;}>) => {
	return (
		<PressableOpacity style={styles.container} onPress={onPress} disabled={onPress === undefined}>
			{isSelected === undefined ? null
				: (<Checkbox
					status={isSelected ? 'checked' : 'unchecked'}
				/>)}
			{children}
		</PressableOpacity>
	);
};
