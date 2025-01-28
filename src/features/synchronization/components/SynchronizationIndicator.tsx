import React, {useMemo} from 'react';

import {Icon} from 'react-native-paper';

import {StyleSheet, View} from 'react-native';
import {selectAreAllTimesheetsInSync} from '../context/synchronizationSelectors';
import {selectIsInternetReachable} from 'src/features/network/context/networkSelector';
import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';
import {selectIsUserLoggingIn} from 'src/features/appState/context/appStateSelectors';
import {useAppSelector} from 'src/features/data/context/store';

const styles = StyleSheet.create({
	icon: {
		margin: 10
	}
});

export const SynchronizationIndicator = () => {
	const areAllTimesheetsInSync = useAppSelector(selectAreAllTimesheetsInSync);
	const isInternetReachable = useAppSelector(selectIsInternetReachable);
	const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
	const isUserLoggingIn = useAppSelector(selectIsUserLoggingIn);

	const iconToDisplay = useMemo(() => {
		const iconString = (() => {
			if (isInternetReachable === false) {
				return 'cloud-off-outline';
			} else if (isUserLoggedIn === false) {
				return 'cloud-alert';
			} else if (isUserLoggingIn === true) {
				return 'cloud-refresh';
			} else if (areAllTimesheetsInSync) {
				return 'cloud-check-outline';
			} else {
				return 'cloud-sync-outline';
			}
		})();

		return <View style={styles.icon}><Icon source={iconString} size={30} /></View>;
	}, [areAllTimesheetsInSync, isInternetReachable, isUserLoggedIn, isUserLoggingIn]);

	return iconToDisplay;
};
