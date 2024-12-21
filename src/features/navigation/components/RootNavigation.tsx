import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';
import {selectApiKey} from 'src/features/authorization/context/authorizationSelectors';
import {screens} from '../screens';
import {ScreenParameters} from '../ScreenParameters';

const RootDrawer = createDrawerNavigator();

const useInitialRouteName = () => {
	const apiKey = useSelector(selectApiKey);

	return apiKey === undefined ? 'Authorization' : 'Home';
}

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
