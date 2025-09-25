import React, {useMemo} from 'react';

import {IconButton} from 'react-native-paper';

import {StyleSheet, View} from 'react-native';
import {selectAreAllTimesheetsInSync} from '../context/synchronizationSelectors';
import {selectIsInternetReachable} from 'src/features/network/context/networkSelector';
import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';
import {selectIsUserLoggingIn} from 'src/features/appState/context/appStateSelectors';
import {useAppNavigation} from 'src/features/navigation/context/hooks';
import {useAppSelector} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	icon: {
		margin: 10,
	},
});

export const SynchronizationIndicator = () => {
	const navigation = useAppNavigation();

	const areAllTimesheetsInSync = useAppSelector(selectAreAllTimesheetsInSync);
	const isInternetReachable = useAppSelector(selectIsInternetReachable);
	const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
	const isUserLoggingIn = useAppSelector(selectIsUserLoggingIn);

	const iconToDisplay = useMemo(() => {
		const {iconString, iconCallback} = (() => {
			if (isInternetReachable === false) {
				return {iconString: 'cloud-off-outline'};
			} else if (isUserLoggedIn === false) {
				return {iconString: 'cloud-alert'};
			} else if (isUserLoggingIn === true) {
				return {iconString: 'cloud-refresh'};
			} else if (areAllTimesheetsInSync) {
				return {iconString: 'cloud-check-outline'};
			} else {
				return {
					iconString: 'cloud-sync-outline',
					iconCallback: () =>
						navigation.navigate('Timesheets', {onlyShowNonDoneEntries: true}),
				};
			}
		})();

		return (
			<View style={styles.icon}>
				<IconButton icon={iconString} onPress={iconCallback} size={30} />
			</View>
		);
	}, [
		areAllTimesheetsInSync,
		isInternetReachable,
		isUserLoggedIn,
		isUserLoggingIn,
		navigation,
	]);

	return iconToDisplay;
};
