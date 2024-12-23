import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';

import {ScreenParameters} from '../ScreenParameters';
import {screens} from '../screens';
import {selectApiKey} from 'src/features/account/context/accountSelectors';

const RootDrawer = createDrawerNavigator();

const useInitialRouteName = () => {
	const apiKey = useSelector(selectApiKey);

	return apiKey === undefined ? 'Account' : 'Home';
};

export const RootNavigation = () => {
	const initialRouteName: keyof ScreenParameters = useInitialRouteName();

	return (
		<RootDrawer.Navigator initialRouteName={initialRouteName}>
			{screens.map((screen) => (
				<RootDrawer.Screen key={screen.name} name={screen.name} component={screen.component} options={screen.options} />
			))}
		</RootDrawer.Navigator>
	);
};
