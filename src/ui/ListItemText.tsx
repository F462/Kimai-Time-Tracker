import React from 'react';

import {StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

const styles = StyleSheet.create({
	itemText: {
		textAlignVertical: 'center'
	}
});

export const ListItemText = ({style, children}: React.PropsWithChildren<{style?: React.ComponentProps<typeof Text>['style']}>) => {
	return <Text style={[styles.itemText, style]}>{children}</Text>;
};
