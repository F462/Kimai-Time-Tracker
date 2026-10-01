import {DrawerHeaderProps} from '@react-navigation/drawer';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {IconButton, Text} from 'react-native-paper';

import i18n from 'src/features/localization/utils/i18n';
import {SynchronizationIndicator} from 'src/features/synchronization/components/SynchronizationIndicator';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 10,
		marginTop: 5,
	},
	headerText: {
		flex: 1,
		marginLeft: 20,
		textAlignVertical: 'center',
	},
});

export const DefaultHeader = ({navigation, route}: DrawerHeaderProps) => {
	const {t} = useTranslation();

	const routeName = route.name;

	const title = (() => {
		if (i18n.exists(`screenTitles.${routeName}`)) {
			return t(`screenTitles.${routeName}`);
		} else {
			return routeName;
		}
	})();
	return (
		<View style={styles.container}>
			<IconButton icon="menu" onPress={navigation.openDrawer} />
			<Text variant="titleLarge" style={styles.headerText}>
				{title}
			</Text>
			<SynchronizationIndicator />
		</View>
	);
};
