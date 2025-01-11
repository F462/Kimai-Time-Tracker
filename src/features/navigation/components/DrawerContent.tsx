import React, {useCallback, useMemo} from 'react';

import {
	DrawerContentComponentProps,
	DrawerItem
} from '@react-navigation/drawer';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useStyle} from 'src/features/theming/utils/useStyle';
import {useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10
	}
});

export const DefaultDrawerContent = ({state, navigation, descriptors}: DrawerContentComponentProps) => {
	const {t} = useTranslation();
	const theme = useTheme();

	const shouldFocus = useCallback((routeName: string) => state.routes.findIndex((route) => route.name === routeName) === state.index, [state.index, state.routes]);
	const DefaultDrawerItem = useCallback(({routeName}: {routeName: string;}) => {
		const routeKey = state.routes.find(route => route.name === routeName)?.key;

		if (routeKey === undefined) {
			return null;
		}

		const drawerIcon = descriptors[routeKey]?.options?.drawerIcon;
		return <DrawerItem focused={shouldFocus(routeName)} label={t(`screenTitles.${routeName}`)} key={routeKey} onPress={() => navigation.navigate(routeName)} icon={drawerIcon} />;
	}, [descriptors, navigation, shouldFocus, state.routes, t]);

	const header = useMemo(() => {
		return <DefaultDrawerItem routeName='Account' />;
	}, [DefaultDrawerItem]);
	const content = useMemo(() => {
		return [
			'ActiveTimesheet',
			'Activities',
			'Customers',
			'Projects',
			'Timesheets'
		].map((routeName) => <DefaultDrawerItem routeName={routeName} key={routeName} />);
	}, [DefaultDrawerItem]);
	const footer = useMemo(() => {
		return <DefaultDrawerItem routeName='About' />;
	}, [DefaultDrawerItem]);

	const dynamicStyles = useStyle(() => ({
		container: {
			backgroundColor: theme.colors.background
		}
	}), [theme.colors.background]);

	return (
		<View style={[styles.container, dynamicStyles.container]}>
			{header}
			<ScrollView>
				{content}
			</ScrollView>
			{footer}
		</View>
	);
};
