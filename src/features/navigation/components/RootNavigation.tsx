import {exitApp} from '@logicwind/react-native-exit-app';
import {
	createDrawerNavigator,
	DrawerHeaderProps,
} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {simplePrompt} from '@sbaiahmed1/react-native-biometrics';
import React, {useCallback, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';
import {selectIsSessionUnlocked} from 'src/features/appState/context/appStateSelectors';
import {userUnlockedSession} from 'src/features/appState/context/appStateSlice';
import {useAppDispatch, useAppSelector} from 'src/features/data/context/store';
import {ScreenParameters} from '../ScreenParameters';
import {screens} from '../screens';
import {DefaultHeader} from './DefaultHeader';
import {DefaultDrawerContent} from './DrawerContent';

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
					exitApp();
				}
			})
			.catch((error) => {
				console.error('Authentication error:', error);
				exitApp();
			});
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
