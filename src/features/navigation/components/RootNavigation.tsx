import React, {useCallback, useEffect} from 'react';

import {
	DrawerHeaderProps,
	createDrawerNavigator,
} from '@react-navigation/drawer';
import BootSplash from 'react-native-bootsplash';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {useTheme} from 'react-native-paper';

import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {DefaultDrawerContent} from './DrawerContent';
import {DefaultHeader} from './DefaultHeader';
import {ScreenParameters} from '../ScreenParameters';
import {screens} from '../screens';
import {selectIsSessionUnlocked} from 'src/features/appState/context/appStateSelectors';
import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';
import {simplePrompt} from '@sbaiahmed1/react-native-biometrics';
import {useTranslation} from 'react-i18next';
import {userUnlockedSession} from 'src/features/appState/context/appStateSlice';

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

const SessionUnlockComponent = () => {
	const {t} = useTranslation();
	const dispatch = useAppDispatch();

	const authenticate = useCallback(() => {
		simplePrompt(t('pleaseAuthenticateToContinue'))
			.then((result) => {
				if (result.success) {
					dispatch(userUnlockedSession());
				} else {
					authenticate();
				}
			})
			.catch((error) => console.error('Authentication error:', error));
	}, [dispatch, t]);

	useEffect(() => {
		authenticate();
	});

	return null;
};

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

	const isSessionUnlocked = useAppSelector(selectIsSessionUnlocked);

	return (
		<SafeAreaView style={styles.container}>
			{!isSessionUnlocked ? (
				<SessionUnlockComponent />
			) : (
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
			)}
		</SafeAreaView>
	);
};
