import React, {useCallback} from 'react';

import {
	DrawerHeaderProps,
	createDrawerNavigator,
} from '@react-navigation/drawer';
import BootSplash from 'react-native-bootsplash';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useTheme} from 'react-native-paper';

import {DefaultDrawerContent} from './DrawerContent';
import {DefaultHeader} from './DefaultHeader';
import {ScreenParameters} from '../ScreenParameters';
import {screens} from '../screens';
import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';

const RootDrawer = createDrawerNavigator();

const useInitialRouteName = () => {
	const isUserLoggedIn = useSelector(selectIsUserLoggedIn);

	return !isUserLoggedIn ? 'Account' : 'ActiveTimesheet';
};

export const RootNavigation = () => {
	const initialRouteName: keyof ScreenParameters = useInitialRouteName();
	const theme = useTheme<any>();

	const header = useCallback(
		(props: DrawerHeaderProps) => <DefaultHeader {...props} />,
		[],
	);

	return (
		<NavigationContainer
			theme={theme}
			onReady={() => {
				BootSplash.hide().catch(console.error);
			}}>
			<RootDrawer.Navigator
				initialRouteName={initialRouteName}
				backBehavior="history"
				screenOptions={{header}}
				drawerContent={DefaultDrawerContent}>
				{screens.map((screen) => (
					<RootDrawer.Screen
						key={screen.name}
						name={screen.name}
						component={screen.component}
						options={screen.options}
					/>
				))}
			</RootDrawer.Navigator>
		</NavigationContainer>
	);
};
