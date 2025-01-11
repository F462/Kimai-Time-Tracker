import React from 'react';

import {IconButton, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {DrawerHeaderProps} from '@react-navigation/drawer';
import i18n from 'src/features/localization/utils/i18n';
import {useTranslation} from 'react-i18next';

import {SynchronizationIndicator} from 'src/features/synchronization/components/SynchronizationIndicator';

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		margin: 10
	},
	headerText: {
		flex: 1,
		marginLeft: 20,
		textAlignVertical: 'center'
	}
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
			<IconButton icon='menu' onPress={navigation.openDrawer} />
			<Text variant='titleLarge' style={styles.headerText}>{title}</Text>
			<SynchronizationIndicator />
		</View>
	);
};
