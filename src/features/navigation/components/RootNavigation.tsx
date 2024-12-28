import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';
import {useTheme} from 'react-native-paper';

import {ScreenParameters} from '../ScreenParameters';
import {screens} from '../screens';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';

const RootDrawer = createDrawerNavigator();

const useInitialRouteName = () => {
	const apiKey = useSelector(selectServerUrl);

	return apiKey === undefined ? 'Account' : 'ActiveTimesheet';
};

export const RootNavigation = () => {
	const initialRouteName: keyof ScreenParameters = useInitialRouteName();
	const theme = useTheme<any>();

	return (
		<NavigationContainer theme={theme}>
			<RootDrawer.Navigator initialRouteName={initialRouteName}>
				{screens.map((screen) => (
					<RootDrawer.Screen key={screen.name} name={screen.name} component={screen.component} options={screen.options} />
				))}
			</RootDrawer.Navigator>
		</NavigationContainer>
	);
};
