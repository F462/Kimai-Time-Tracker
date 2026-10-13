import React, {useMemo} from 'react';
import {IconButton} from 'react-native-paper';

import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';
import {selectIsUserLoggingIn} from 'src/features/appState/context/appStateSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {useAppNavigation} from 'src/features/navigation/context/hooks';
import {selectIsInternetReachable} from 'src/features/network/context/networkSelector';
import {
	selectHasWorkContractHoursSyncStatus,
	selectIsWorkContractHoursSyncInProgress,
} from 'src/features/settings/context/settingsSelectors';
import {selectAreAllTimesheetsInSync} from '../context/synchronizationSelectors';

export const SynchronizationIndicator = () => {
	const navigation = useAppNavigation();

	const areAllTimesheetsInSync = useAppSelector(selectAreAllTimesheetsInSync);
	const isInternetReachable = useAppSelector(selectIsInternetReachable);
	const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
	const isUserLoggingIn = useAppSelector(selectIsUserLoggingIn);
	const hasWorkContractSyncStatus = useAppSelector(
		selectHasWorkContractHoursSyncStatus,
	);
	const isWorkContractSyncInProgress = useAppSelector(
		selectIsWorkContractHoursSyncInProgress,
	);

	const iconToDisplay = useMemo(() => {
		const {iconString, iconCallback} = (() => {
			if (isInternetReachable === false) {
				return {iconString: 'cloud-off-outline'};
			} else if (isUserLoggedIn === false) {
				return {iconString: 'cloud-alert'};
			} else if (isUserLoggingIn === true) {
				return {iconString: 'cloud-refresh'};
			} else if (isWorkContractSyncInProgress) {
				return {iconString: 'cloud-sync'};
			} else if (hasWorkContractSyncStatus) {
				return {iconString: 'cloud-upload-outline'};
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

		return <IconButton icon={iconString} onPress={iconCallback} size={30} />;
	}, [
		areAllTimesheetsInSync,
		isInternetReachable,
		isUserLoggedIn,
		isUserLoggingIn,
		hasWorkContractSyncStatus,
		isWorkContractSyncInProgress,
		navigation,
	]);

	return iconToDisplay;
};
