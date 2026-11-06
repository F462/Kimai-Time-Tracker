import {userLoggedIn} from 'src/features/account/context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {fetchActivities, synchronizeLocalActivities} from './activitiesThunks';

const fetchActivitiesOnUserLogin = (startListening: AppStartListening) => {
	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(synchronizeLocalActivities());
			await listenerApi.dispatch(fetchActivities());
		},
	});
};

const synchronizeActivitiesOnReconnect = (
	startListening: AppStartListening,
) => {
	startListening({
		actionCreator: internetReachabilityChanged,
		effect: async ({payload: isInternetReachable}, listenerApi) => {
			if (isInternetReachable) {
				await listenerApi.dispatch(synchronizeLocalActivities());
			}
		},
	});
};

export const startActivityListeners = (startListening: AppStartListening) => {
	fetchActivitiesOnUserLogin(startListening);
	synchronizeActivitiesOnReconnect(startListening);
};
