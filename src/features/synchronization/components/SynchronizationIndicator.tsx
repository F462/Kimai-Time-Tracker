import React, {useMemo, useState} from 'react';
import {IconButton} from 'react-native-paper';

import {selectIsUserLoggedIn} from 'src/features/account/context/accountSelectors';
import {selectIsUserLoggingIn} from 'src/features/appState/context/appStateSelectors';
import {selectHasUnsynchronizedCustomers} from 'src/features/customers/context/customersSelectors';
import {useAppSelector} from 'src/features/data/context/store';
import {useAppNavigation} from 'src/features/navigation/context/hooks';
import {selectIsInternetReachable} from 'src/features/network/context/networkSelector';
import {selectHasUnsynchronizedProjects} from 'src/features/projects/context/projectsSelectors';
import {
	selectHasWorkContractHoursSyncStatus,
	selectIsWorkContractHoursSyncInProgress,
} from 'src/features/settings/context/settingsSelectors';
import {selectHasUnsynchronizedUsers} from 'src/features/users/context/usersSelectors';
import {selectAreAllTimesheetsInSync} from '../context/synchronizationSelectors';
import {SynchronizeModal} from './SynchronizeModal';

export const SynchronizationIndicator = () => {
	const navigation = useAppNavigation();
	const [isSyncModalVisible, setSyncModalVisible] = useState(false);

	const areAllTimesheetsInSync = useAppSelector(selectAreAllTimesheetsInSync);
	const hasUnsynchronizedCustomers = useAppSelector(
		selectHasUnsynchronizedCustomers,
	);
	const hasUnsynchronizedProjects = useAppSelector(
		selectHasUnsynchronizedProjects,
	);
	const hasUnsynchronizedUsers = useAppSelector(selectHasUnsynchronizedUsers);
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
				return {
					iconString: 'cloud-off-outline',
					iconCallback:
						isUserLoggedIn === false
							? () => navigation.navigate('Account')
							: undefined,
				};
			} else if (isUserLoggedIn === false) {
				return {
					iconString: 'cloud-alert',
					iconCallback: () => navigation.navigate('Account'),
				};
			} else if (isUserLoggingIn === true) {
				return {iconString: 'cloud-refresh'};
			} else if (
				hasUnsynchronizedCustomers ||
				hasUnsynchronizedProjects ||
				hasUnsynchronizedUsers
			) {
				return {
					iconString: 'cloud-upload-outline',
					iconCallback: () => setSyncModalVisible(true),
				};
			} else if (hasWorkContractSyncStatus) {
				return {
					iconString: isWorkContractSyncInProgress
						? 'cloud-sync'
						: 'cloud-upload-outline',
					iconCallback: () => setSyncModalVisible(true),
				};
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
		hasUnsynchronizedCustomers,
		hasUnsynchronizedProjects,
		hasUnsynchronizedUsers,
		isInternetReachable,
		isUserLoggedIn,
		isUserLoggingIn,
		hasWorkContractSyncStatus,
		isWorkContractSyncInProgress,
		navigation,
	]);

	return (
		<>
			{iconToDisplay}
			<SynchronizeModal
				visible={isSyncModalVisible}
				onHide={() => setSyncModalVisible(false)}
			/>
		</>
	);
};
