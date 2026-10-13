import {userLoggedIn} from 'src/features/account/context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {selectIsWorkContractHoursSyncPending} from '../context/settingsSelectors';
import {workContractHoursPerDaySet} from '../context/settingsSlice';
import {synchronizeWorkContractHours} from './settingsThunks';

export const startSettingsListeners = (startListening: AppStartListening) => {
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
		actionCreator: workContractHoursPerDaySet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(
				synchronizeWorkContractHours({direction: 'push'}),
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
