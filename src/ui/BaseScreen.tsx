import React from 'react';

import {StyleSheet, View} from 'react-native';

const styles = StyleSheet.create({
	container: {
		margin: 10,
		flex: 1
	}
});

export const BaseScreen = ({children}: React.PropsWithChildren<{}>) => {
	return <View style={styles.container}>{children}</View>;
};
