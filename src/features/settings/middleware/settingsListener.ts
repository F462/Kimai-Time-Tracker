import {userLoggedIn} from 'src/features/account/context/accountActions';
import {appBecameActive} from 'src/features/appState/context/appStateSlice';
import {runAutomaticBackupIfDue} from 'src/features/backup/middleware/backupThunks';
import {AppStartListening} from 'src/features/data/context/store';
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {selectIsWorkContractHoursSyncPending} from '../context/settingsSelectors';
import {synchronizeWorkContractHours} from './settingsThunks';

export const startSettingsListeners = (startListening: AppStartListening) => {
	startListening({
		actionCreator: appBecameActive,
		effect: async (_, listenerApi) => {
			try {
				await listenerApi.dispatch(runAutomaticBackupIfDue()).unwrap();
			} catch (error) {
				console.warn('Automatic backup failed', error);
			}
		},
	});

	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(
				synchronizeWorkContractHours({
					direction: selectIsWorkContractHoursSyncPending(
						listenerApi.getState(),
					)
						? 'push'
						: 'pull',
				}),
			);
		},
	});

	startListening({
		actionCreator: internetReachabilityChanged,
		effect: async ({payload: isInternetReachable}, listenerApi) => {
			if (
				isInternetReachable !== true ||
				!selectIsWorkContractHoursSyncPending(listenerApi.getState())
			) {
				return;
			}

			await listenerApi.dispatch(
				synchronizeWorkContractHours({direction: 'push'}),
			);
		},
	});
};
