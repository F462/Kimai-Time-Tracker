import React from 'react';

import {StyleSheet, View} from 'react-native';
import {Checkbox} from 'react-native-paper';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginHorizontal: 10,
		marginVertical: 5
	}
});

export const ListItem = ({isSelected, children}: React.PropsWithChildren<{isSelected?: boolean}>) => {
	return (
		<View style={styles.container}>
			{isSelected === undefined ? null
				: (<Checkbox
					status={isSelected ? 'checked' : 'unchecked'}
				/>)}
			{children}
		</View>
	);
};
