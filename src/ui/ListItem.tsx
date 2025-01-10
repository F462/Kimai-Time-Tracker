import React from 'react';

import {StyleSheet, View} from 'react-native';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		marginHorizontal: 10,
		marginVertical: 5
	}
});

export const ListItem = ({children}: React.PropsWithChildren<{}>) => {
	return (
		<View style={styles.container}>
			{children}
		</View>
	);
};
